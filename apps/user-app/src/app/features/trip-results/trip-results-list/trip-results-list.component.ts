import { Component, OnInit, ChangeDetectionStrategy, inject, computed, signal, PLATFORM_ID } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { TripResult } from '@models/lib/trip-result.model';
import { LoadingSpinnerComponent } from '@ui/lib/loading-spinner/loading-spinner.component';
import { LinkService } from '@user/services/link.service';
import {
  loadTripResults,
  selectAllTripResults,
  selectTripResultsIsLoading,
} from '@user/core/store/trip-results';

/** Above this many photos the dot strip is wider than the card, so it gives way to an "n / total"
 *  counter. Purely a display switch — every photo stays reachable through the arrows either way. */
const DOTS_LIMIT = 8;

/** A trip result flattened for the card template — route string and preview photos precomputed. */
interface TripResultCard {
  id: string;
  date: string;
  route: string;
  photoCount: number;
  previews: { id: string; url: string }[];
  showDots: boolean;
}

@Component({
  selector: 'app-trip-results-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, TranslocoModule, LoadingSpinnerComponent],
  templateUrl: './trip-results-list.component.html',
  styleUrls: ['./trip-results-list.component.scss'],
})
export class TripResultsListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly linkService = inject(LinkService);

  readonly results = toSignal(this.store.select(selectAllTripResults), { initialValue: [] as TripResult[] });
  readonly loading = toSignal(this.store.select(selectTripResultsIsLoading), { initialValue: false });

  /** Visible preview photo per card, keyed by trip result id. Absent = first photo. */
  private readonly activeByCard = signal<Record<string, number>>({});

  readonly cards = computed<TripResultCard[]>(() =>
    this.results().map((result) => {
      /* The public list endpoint ships the full (eagerly loaded) photos array, so the
         carousel needs no extra request. Fall back to the cover if that ever changes. */
      const photos = result.photos?.length
        ? result.photos.map((photo) => ({ id: photo.id, url: photo.url }))
        : result.coverPhotoUrl
          ? [{ id: 'cover', url: result.coverPhotoUrl }]
          : [];

      return {
        id: result.id,
        date: result.date,
        route: `${result.departureCity} → ${result.arrivalCity}`,
        photoCount: result.photoCount,
        previews: photos,
        showDots: photos.length <= DOTS_LIMIT,
      };
    }),
  );

  /** "Nothing published yet" is only truthful once the browser has actually resolved a
   *  fetch — a failed or pending SSR pass must render the loader, not an empty state. */
  readonly showEmpty = computed(() => this.isBrowser && !this.loading() && this.results().length === 0);
  readonly showLoader = computed(() => !this.showEmpty() && this.results().length === 0);

  ngOnInit(): void {
    this.store.dispatch(loadTripResults());
  }

  activeIndex(cardId: string): number {
    return this.activeByCard()[cardId] ?? 0;
  }

  /**
   * Keeps only the active photo and its two neighbours in the DOM. A stacked `<img>` at
   * `opacity: 0` is still in the viewport, so the browser downloads it regardless of
   * `loading="lazy"` — rendering a whole 30-photo gallery per card would pull the entire
   * grid's worth of images on first paint. The neighbours are what make the crossfade work
   * (the outgoing photo is still mounted) and preload one step ahead in each direction.
   */
  isNearActive(card: TripResultCard, index: number): boolean {
    const gap = Math.abs(index - this.activeIndex(card.id));
    return Math.min(gap, card.previews.length - gap) <= 1;
  }

  /** Wraps around, so the arrows never dead-end on the first/last preview. */
  step(card: TripResultCard, delta: number): void {
    const total = card.previews.length;
    if (total < 2) return;
    this.show(card.id, (this.activeIndex(card.id) + delta + total) % total);
  }

  show(cardId: string, index: number): void {
    this.activeByCard.update((current) => ({ ...current, [cardId]: index }));
  }
}
