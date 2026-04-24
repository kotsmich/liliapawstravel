import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, computed, signal, ViewChild, ElementRef, isDevMode } from '@angular/core';
import { DatePipe, DecimalPipe, ViewportScroller } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { TripDestination } from '@models/lib/trip.model';
import { firstValueFrom } from 'rxjs';
import { DogFormComponent } from '@ui/lib/dog-form/dog-form.component';
import { TripCalendarComponent } from '@ui/lib/trip-calendar/trip-calendar.component';
import { ToastNotificationComponent } from '@ui/lib/toast-notification/toast-notification.component';
import { CalendarEvent } from '@models/lib/calendar-event.model';
import { RandomUtil, RandomProperty } from '@models/lib/utils';
import { clearSelectedTrip, selectTripsAsCalendarEvents, selectTripsIsLoading } from '@user/core/store/trips';
import { selectDate, clearDate, selectCalendarSelectedDate, selectTripForSelectedDate } from '@user/core/store/calendar';
import { submitRequest, resetRequest, selectTripRequestIsLoading, selectTripRequestIsSuccess, selectTripRequestError } from '@user/features/trip-request/store';
import { TripsService } from '@user/services/trips.service';
import { FocusInvalidInputDirective } from '@ui/lib/directives/focus-invalid-input.directive';
import { TripRequestHeroComponent } from './components/trip-request-hero/trip-request-hero.component';
import { TripRequestSidebarComponent } from './components/trip-request-sidebar/trip-request-sidebar.component';
import { TripDetailsCardComponent } from './components/trip-details-card/trip-details-card.component';
import { NoTripHintComponent } from './components/no-trip-hint/no-trip-hint.component';
@Component({
  selector: 'app-trip-request',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, ReactiveFormsModule, FormsModule,
    AccordionModule, ButtonModule, DividerModule, MessageModule, ConfirmDialogModule,
    InputTextModule, IftaLabelModule, SelectModule, ProgressSpinnerModule, TagModule,
    DogFormComponent, TripCalendarComponent, ToastNotificationComponent, TranslocoModule, TooltipModule,
    FocusInvalidInputDirective,
    TripRequestHeroComponent, TripRequestSidebarComponent, TripDetailsCardComponent, NoTripHintComponent,
  ],
  templateUrl: './trip-request.component.html',
  styleUrls: ['./trip-request.component.scss'],
})
export class TripRequestComponent {
  readonly phoneCountryCodes = [
    { label: 'Greece +30',      code: 'gr', value: '+30'  },
    { label: 'USA +1',          code: 'us', value: '+1'   },
    { label: 'UK +44',          code: 'gb', value: '+44'  },
    { label: 'Germany +49',     code: 'de', value: '+49'  },
    { label: 'France +33',      code: 'fr', value: '+33'  },
    { label: 'Italy +39',       code: 'it', value: '+39'  },
    { label: 'Spain +34',       code: 'es', value: '+34'  },
    { label: 'Netherlands +31', code: 'nl', value: '+31'  },
    { label: 'Belgium +32',     code: 'be', value: '+32'  },
    { label: 'Switzerland +41', code: 'ch', value: '+41'  },
    { label: 'Austria +43',     code: 'at', value: '+43'  },
    { label: 'Portugal +351',   code: 'pt', value: '+351' },
    { label: 'Poland +48',      code: 'pl', value: '+48'  },
    { label: 'Romania +40',     code: 'ro', value: '+40'  },
    { label: 'Bulgaria +359',   code: 'bg', value: '+359' },
    { label: 'Cyprus +357',     code: 'cy', value: '+357' },
    { label: 'Australia +61',   code: 'au', value: '+61'  },
  ];
  phoneCountryCode = '+30';

  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly transloco = inject(TranslocoService);
  private readonly tripsService = inject(TripsService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('dogsSection') private dogsSection?: ElementRef<HTMLElement>;
  @ViewChild(TripCalendarComponent) private tripCalendar?: TripCalendarComponent;

  showSummary = false;
  readonly openDogs = signal<string[]>(['0']);
  private readonly uploading = signal(false);

  readonly dogPhotoFiles = new Map<number, File>();
  readonly dogDocumentFiles = new Map<number, File>();

  readonly calendarEvents  = toSignal(this.store.select(selectTripsAsCalendarEvents), { initialValue: [] as CalendarEvent[] });
readonly selectedDateLocal = toSignal(this.store.select(selectCalendarSelectedDate), { initialValue: null as string | null });
  readonly selectedTrip    = toSignal(this.store.select(selectTripForSelectedDate),   { initialValue: null });
  readonly pickupDestinations = computed((): TripDestination[] => {
    const trip = this.selectedTrip();
    if (!trip) return [];
    return trip.pickupLocations ?? [];
  });
  readonly loading         = toSignal(this.store.select(selectTripsIsLoading),         { initialValue: false });
  private readonly storeSubmitting = toSignal(this.store.select(selectTripRequestIsLoading), { initialValue: false });
  readonly submitting      = computed(() => this.uploading() || this.storeSubmitting());
  readonly success         = toSignal(this.store.select(selectTripRequestIsSuccess),   { initialValue: false });
  readonly error           = toSignal(this.store.select(selectTripRequestError),       { initialValue: null as string | null });

  readonly form = this.fb.group({
    requesterName:  [isDevMode() ? RandomUtil.pick(RandomProperty.requesterNames)  : '', Validators.required],
    requesterEmail: [isDevMode() ? RandomUtil.pick(RandomProperty.requesterEmails) : '', [Validators.required, Validators.email]],
    requesterPhone: [isDevMode() ? RandomUtil.pick(RandomProperty.requesterPhones) : '', Validators.required],
    dogs: this.fb.array([this.dogGroup()]),
  });

  readonly formInvalid = toSignal(
    this.form.statusChanges.pipe(map(() => this.form.invalid)),
    { initialValue: this.form.invalid },
  );

  readonly nextAvailableTrip = computed(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return this.calendarEvents()
      .filter(e => !e.isFull && e.acceptingRequests !== false && e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
  });

  readonly calendarDone = computed(() => !!this.selectedTrip());
  readonly dogsDone = computed(() => {
    this.formInvalid();
    return this.dogs.valid;
  });
  readonly contactDone = computed(() => {
    this.formInvalid();
    return (
      (this.form.get('requesterName')?.valid ?? false) &&
      (this.form.get('requesterEmail')?.valid ?? false) &&
      (this.form.get('requesterPhone')?.valid ?? false)
    );
  });

  constructor() {
    // Toast handled by NotificationEffects — reset form and scroll on success
    this.store.select(selectTripRequestIsSuccess).pipe(
      filter(Boolean),
      takeUntilDestroyed(),
    ).subscribe(() => {
      this.onReset();
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }

  get dogs(): FormArray { return this.form.get('dogs') as FormArray; }

  dogGroup() {
    return this.fb.group({
      name:           [isDevMode() ? RandomUtil.pick(RandomProperty.dogNames) : null, Validators.required],
      size:           [],
      height:         [null],
      behaviors:      [[] as string[]],
      gender:         ['male',                                 Validators.required],
      age:            [ 1 ,                                 [Validators.required, Validators.min(0)]],
      chipId:         [''],
      pickupLocation: [null, Validators.required],
      dropLocation:   [null, Validators.required],
      notes:          [null],
      receiver:       [null],
    });
  }

  onDogPhotoChange(index: number, file: File | null): void {
    if (file) {
      this.dogPhotoFiles.set(index, file);
    } else {
      this.dogPhotoFiles.delete(index);
    }
  }

  onDogDocumentChange(index: number, file: File | null): void {
    if (file) {
      this.dogDocumentFiles.set(index, file);
    } else {
      this.dogDocumentFiles.delete(index);
    }
  }

  addDog(): void {
    this.dogs.push(this.dogGroup());
    const newIndex = (this.dogs.length - 1).toString();
    this.openDogs.update(prev => [...prev, newIndex]);
    this.showSummary = false;
  }

  removeDog(index: number): void {
    this.confirmationService.confirm({
      header: this.transloco.translate('tripRequest.removeDog'),
      message: this.transloco.translate('tripRequest.dogNum', { num: index + 1 }),
      acceptLabel: this.transloco.translate('tripRequest.remove'),
      rejectLabel: this.transloco.translate('tripRequest.collapse'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.dogs.removeAt(index);
        this.showSummary = false;
        this.openDogs.update(prev =>
          prev
            .filter(v => v !== index.toString())
            .map(v => +v > index ? (+v - 1).toString() : v),
        );
        // Shift file maps: remove index, move higher indices down
        this.dogPhotoFiles.delete(index);
        this.dogDocumentFiles.delete(index);
        const totalDogs = this.dogs.length;
        for (let i = index; i < totalDogs; i++) {
          const photo = this.dogPhotoFiles.get(i + 1);
          const doc = this.dogDocumentFiles.get(i + 1);
          photo ? this.dogPhotoFiles.set(i, photo) : this.dogPhotoFiles.delete(i);
          doc ? this.dogDocumentFiles.set(i, doc) : this.dogDocumentFiles.delete(i);
        }
        this.dogPhotoFiles.delete(totalDogs);
        this.dogDocumentFiles.delete(totalDogs);
      },
    });
  }

  onRemoveDogClick(event: MouseEvent, index: number): void {
    event.stopPropagation();
    this.removeDog(index);
  }

  onJumpToNextTrip(): void {
    const next = this.nextAvailableTrip();
    if (!next) return;
    this.tripCalendar?.navigateTo(next.date);
    this.onDateSelected(next.date);
  }

  onDateSelected(date: string): void {
    const hasDogWork =
      this.dogs.dirty ||
      this.dogPhotoFiles.size > 0 ||
      this.dogDocumentFiles.size > 0;

    if (hasDogWork && date !== this.selectedDateLocal()) {
      this.confirmationService.confirm({
        header: this.transloco.translate('tripRequest.changeDateTitle'),
        message: this.transloco.translate('tripRequest.changeDateMessage'),
        acceptLabel: this.transloco.translate('tripRequest.changeDateConfirm'),
        rejectLabel: this.transloco.translate('tripRequest.changeDateCancel'),
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => {
          this.resetDogs();
          this.store.dispatch(selectDate({ date }));
          this.scrollToDogForm();
        },
      });
    } else {
      this.store.dispatch(selectDate({ date }));
      this.scrollToDogForm();
    }
  }

  private scrollToDogForm(): void {
    setTimeout(() => this.dogsSection?.nativeElement.scrollIntoView({  block: 'center'}), 10);
  }

  private resetDogs(): void {
    this.dogs.clear();
    this.dogs.push(this.dogGroup());
    this.dogs.markAsPristine();
    this.openDogs.set(['0']);
    this.dogPhotoFiles.clear();
    this.dogDocumentFiles.clear();
    this.showSummary = false;
  }

  preview(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.openInvalidDogPanels();
      return;
    }
    this.showSummary = true;
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.openInvalidDogPanels();
      this.cdr.detectChanges();
      return;
    }
    this.uploading.set(true);
    try {
      const { requesterName, requesterEmail, requesterPhone } = this.form.value;
      const dogs = await this.uploadDogFiles(this.form.value.dogs as Record<string, unknown>[]);
      this.store.dispatch(submitRequest({
        dogs,
        tripId: this.selectedTrip()!.id,
        requesterName: requesterName!,
        requesterEmail: requesterEmail!,
        requesterPhone: `${this.phoneCountryCode} ${requesterPhone!}`.trim(),
      }));
    } finally {
      this.uploading.set(false);
    }
  }

  private async uploadDogFiles(dogs: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
    return Promise.all(
      dogs.map(async (dog, index) => {
        const photoFile = this.dogPhotoFiles.get(index);
        const docFile = this.dogDocumentFiles.get(index);
        if (!photoFile && !docFile) return dog;

        const formData = new FormData();
        if (photoFile) formData.append('photo', photoFile);
        if (docFile) formData.append('document', docFile);

        try {
          const urls = await firstValueFrom(this.tripsService.uploadTempDogFiles(formData));
          return {
            ...dog,
            photoUrl: urls.photoUrl ?? null,
            documentUrl: urls.documentUrl ?? null,
          };
        } catch {
          this.messageService.add({
            severity: 'warn',
            summary: this.transloco.translate('tripRequest.uploadFailedTitle'),
            detail: this.transloco.translate('tripRequest.uploadFailedDetail'),
          });
          return dog;
        }
      }),
    );
  }

  private openInvalidDogPanels(): void {
    const open = new Set(this.openDogs());
    this.dogs.controls.forEach((ctrl, i) => {
      if (ctrl.invalid) open.add(i.toString());
    });
    this.openDogs.set([...open]);
  }

  onReset(): void {
    this.form.reset();
    this.dogs.clear();
    this.dogs.push(this.dogGroup());
    this.showSummary = false;
    this.openDogs.set(['0']);
    this.dogPhotoFiles.clear();
    this.dogDocumentFiles.clear();
    this.store.dispatch(resetRequest());
    this.store.dispatch(clearSelectedTrip());
    this.store.dispatch(clearDate());
  }
}
