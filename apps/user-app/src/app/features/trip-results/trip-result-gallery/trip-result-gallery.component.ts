import { Component, OnInit, ChangeDetectionStrategy, HostListener, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { TripResult } from '@models/lib/trip-result.model';
import { LoadingSpinnerComponent } from '@ui/lib/loading-spinner/loading-spinner.component';
import { LinkService } from '@user/services/link.service';
import {
  loadTripResultById,
  selectSelectedTripResult,
  selectTripResultsIsLoading,
  selectTripResultsError,
} from '@user/core/store/trip-results';

@Component({
  selector: 'app-trip-result-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, TranslocoModule, LoadingSpinnerComponent],
  templateUrl: './trip-result-gallery.component.html',
  styleUrls: ['./trip-result-gallery.component.scss'],
})
export class TripResultGalleryComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly linkService = inject(LinkService);

  readonly result = toSignal(this.store.select(selectSelectedTripResult), { initialValue: null as TripResult | null });
  readonly loading = toSignal(this.store.select(selectTripResultsIsLoading), { initialValue: false });
  readonly error = toSignal(this.store.select(selectTripResultsError), { initialValue: null as string | null });

  /** A failed fetch during SSR must not paint "not found" into the served HTML: the
   *  browser re-dispatches on hydration, so the SSR frame keeps showing the loader. */
  readonly showError = computed(() => this.isBrowser && !this.loading() && !!this.error());
  /** Covers loading, the pre-dispatch frame, and a server-side failure. */
  readonly showLoader = computed(() => !this.showError() && !this.result());

  /** Index of the photo shown in the lightbox; null when it is closed. */
  readonly lightboxIndex = signal<number | null>(null);
  readonly lightboxPhoto = computed(() => {
    const index = this.lightboxIndex();
    return index === null ? null : this.result()?.photos[index] ?? null;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.store.dispatch(loadTripResultById({ id }));
  }

  openLightbox(index: number): void {
    this.lightboxIndex.set(index);
  }

  closeLightbox(): void {
    this.lightboxIndex.set(null);
  }

  step(delta: number): void {
    const photos = this.result()?.photos ?? [];
    const current = this.lightboxIndex();
    if (current === null || photos.length === 0) return;
    this.lightboxIndex.set((current + delta + photos.length) % photos.length);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.lightboxIndex() === null) return;
    if (event.key === 'Escape') this.closeLightbox();
    else if (event.key === 'ArrowRight') this.step(1);
    else if (event.key === 'ArrowLeft') this.step(-1);
  }

  trackById(_: number, photo: { id: string }): string { return photo.id; }
}
