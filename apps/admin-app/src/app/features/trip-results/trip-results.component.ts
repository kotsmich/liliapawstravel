import {
  Component, OnInit, ChangeDetectionStrategy, inject, signal, computed, viewChild, ElementRef,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge, filter } from 'rxjs';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LocalDatePipe } from '@ui/lib/pipes/local-date.pipe';
import { LoadingSpinnerComponent } from '@ui/lib/loading-spinner/loading-spinner.component';
import { ValidationErrorDirective } from '@ui/lib/directives/validation-error.directive';
import { TripResult, TripResultPhoto } from '@models/lib/trip-result.model';
import { toIsoDateStr } from '@admin/shared/utils/date';
import { sanitizeHtml } from '@admin/shared/utils/sanitize';
import { ConfirmActionService } from '@admin/shared/services/confirm-action.service';
import {
  loadTripResults, addTripResult, updateTripResult, deleteTripResult,
  uploadTripResultPhotos, deleteTripResultPhoto,
  selectAllTripResults, selectTripResultEntities,
  selectTripResultsIsLoading, selectTripResultsIsMutating,
} from './store';

@Component({
  selector: 'app-trip-results-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, TranslocoModule,
    ButtonModule, CardModule, DialogModule, DatePickerModule, InputTextModule,
    IftaLabelModule, ConfirmDialogModule,
    LocalDatePipe, LoadingSpinnerComponent, ValidationErrorDirective,
  ],
  templateUrl: './trip-results.component.html',
  styleUrls: ['./trip-results.component.scss'],
})
export class TripResultsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly transloco = inject(TranslocoService);
  private readonly confirm = inject(ConfirmActionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly results = toSignal(this.store.select(selectAllTripResults), { initialValue: [] as TripResult[] });
  readonly loading = toSignal(this.store.select(selectTripResultsIsLoading), { initialValue: false });
  readonly mutating = toSignal(this.store.select(selectTripResultsIsMutating), { initialValue: false });
  private readonly entities = toSignal(this.store.select(selectTripResultEntities), {
    initialValue: {} as Record<string, TripResult | undefined>,
  });

  readonly formVisible = signal(false);
  readonly editId = signal<string | null>(null);
  /** Files staged in the create dialog; uploaded right after the result is created. */
  readonly pendingPhotos = signal<File[]>([]);
  private readonly pendingPhotosInput = viewChild<ElementRef<HTMLInputElement>>('pendingPhotosInput');

  readonly photosDialogId = signal<string | null>(null);
  readonly photosDialogResult = computed(() => {
    const id = this.photosDialogId();
    return id ? this.entities()[id] ?? null : null;
  });

  readonly form = this.fb.nonNullable.group({
    date: [new Date(), Validators.required],
    departureCity: ['', Validators.required],
    arrivalCity: ['', Validators.required],
  });

  ngOnInit(): void {
    this.store.dispatch(loadTripResults());

    /**
     * Trip results are only fetched on mount, so a result created in another admin tab (or by
     * another operator) stays invisible here until a manual reload — the grid and the public
     * site then disagree. Unlike requests/messages there's no WS event for them, so refetch
     * when the operator comes back to this page instead. `focus` covers a second *window*,
     * where visibility never changes.
     */
    merge(fromEvent(document, 'visibilitychange'), fromEvent(window, 'focus'))
      .pipe(
        filter(() => document.visibilityState === 'visible'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.store.dispatch(loadTripResults()));
  }

  openCreate(): void {
    this.editId.set(null);
    this.clearPendingPhotos();
    this.form.reset({ date: new Date(), departureCity: '', arrivalCity: '' });
    this.formVisible.set(true);
  }

  openEdit(result: TripResult): void {
    this.editId.set(result.id);
    this.clearPendingPhotos();
    this.form.reset({
      date: new Date(result.date + 'T00:00:00'),
      departureCity: result.departureCity,
      arrivalCity: result.arrivalCity,
    });
    this.formVisible.set(true);
  }

  closeForm(): void {
    this.clearPendingPhotos();
    this.formVisible.set(false);
  }

  onPendingPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pendingPhotos.set(Array.from(input.files ?? []));
  }

  /**
   * PrimeNG projects dialog content into an `@if`, so hiding the dialog only *detaches* the
   * file input — the element (and its `FileList`) survives and is reattached on reopen, still
   * listing the previously chosen files. Resetting the signal alone leaves the input and the
   * "N picked" hint disagreeing, so clear both whenever the dialog opens or closes.
   */
  private clearPendingPhotos(): void {
    this.pendingPhotos.set([]);
    const input = this.pendingPhotosInput()?.nativeElement;
    if (input) input.value = '';
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { date, departureCity, arrivalCity } = this.form.getRawValue();
    const payload = {
      date: toIsoDateStr(date),
      departureCity: departureCity.trim(),
      arrivalCity: arrivalCity.trim(),
    };

    const id = this.editId();
    if (id) {
      this.store.dispatch(updateTripResult({ id, result: payload }));
    } else {
      this.store.dispatch(addTripResult({ result: payload, photos: this.pendingPhotos() }));
    }
    this.closeForm();
  }

  remove(result: TripResult): void {
    const route = `${sanitizeHtml(result.departureCity)} → ${sanitizeHtml(result.arrivalCity)}`;
    this.confirm.confirm({
      header: this.transloco.translate('tripResults.confirm.delete.header'),
      message: this.transloco.translate('tripResults.confirm.delete.message', { route, date: result.date }),
      acceptLabel: this.transloco.translate('common.delete'),
      severity: 'danger',
      accept: () => this.store.dispatch(deleteTripResult({ id: result.id })),
    });
  }

  openPhotos(result: TripResult): void {
    this.photosDialogId.set(result.id);
  }

  closePhotos(): void {
    this.photosDialogId.set(null);
  }

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const photos = Array.from(input.files ?? []);
    const id = this.photosDialogId();
    if (id && photos.length) this.store.dispatch(uploadTripResultPhotos({ id, photos }));
    // Clear so re-picking the same file still fires a change event.
    input.value = '';
  }

  removePhoto(photo: TripResultPhoto): void {
    const id = this.photosDialogId();
    if (!id) return;
    this.confirm.confirm({
      header: this.transloco.translate('tripResults.confirm.deletePhoto.header'),
      message: this.transloco.translate('tripResults.confirm.deletePhoto.message'),
      acceptLabel: this.transloco.translate('common.delete'),
      severity: 'danger',
      accept: () => this.store.dispatch(deleteTripResultPhoto({ id, photoId: photo.id })),
    });
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
}
