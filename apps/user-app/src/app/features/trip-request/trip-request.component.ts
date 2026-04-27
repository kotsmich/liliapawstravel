import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Injector, afterNextRender, inject, computed, runInInjectionContext, signal, ViewChild, ElementRef } from '@angular/core';
import { DatePipe, ViewportScroller } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { ConfirmationService } from 'primeng/api';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { TripDestination } from '@models/lib/trip.model';
import { DogFormComponent } from '@ui/lib/dog-form/dog-form.component';
import { TripCalendarComponent } from '@ui/lib/trip-calendar/trip-calendar.component';
import { CalendarEvent } from '@models/lib/calendar-event.model';
import { devSeed, RandomProperty } from '@models/lib/utils';
import { selectTripsAsCalendarEvents, selectTripsIsLoading, selectAllTrips, selectNextAvailableTrip } from '@user/core/store/trips';
import { submitRequest, submitRequestSuccess, resetRequest, selectTripRequestIsLoading, selectTripRequestIsSuccess, selectTripRequestError, DogFiles } from '@user/features/trip-request/store';
import { FocusInvalidInputDirective } from '@ui/lib/directives/focus-invalid-input.directive';
import { ValidationErrorDirective } from '@ui/lib/directives/validation-error.directive';
import { TripRequestHeroComponent } from './components/trip-request-hero/trip-request-hero.component';
import { TripRequestSidebarComponent } from './components/trip-request-sidebar/trip-request-sidebar.component';
import { TripDetailsCardComponent } from './components/trip-details-card/trip-details-card.component';
import { NoTripHintComponent } from './components/no-trip-hint/no-trip-hint.component';
import { StepHeaderComponent } from './components/step-header/step-header.component';
import { PhoneInputComponent } from '@user/shared/components/phone-input/phone-input.component';
@Component({
  selector: 'app-trip-request',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, ReactiveFormsModule,
    AccordionModule, ButtonModule, DividerModule, MessageModule, ConfirmDialogModule,
    InputTextModule, IftaLabelModule, ProgressSpinnerModule, TagModule,
    DogFormComponent, TripCalendarComponent, TranslocoModule, TooltipModule,
    FocusInvalidInputDirective, ValidationErrorDirective,
    TripRequestHeroComponent, TripRequestSidebarComponent, TripDetailsCardComponent, NoTripHintComponent,
    StepHeaderComponent, PhoneInputComponent,
  ],
  templateUrl: './trip-request.component.html',
  styleUrls: ['./trip-request.component.scss'],
})
export class TripRequestComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly transloco = inject(TranslocoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);

  @ViewChild('dogsSection') private dogsSection?: ElementRef<HTMLElement>;
  @ViewChild(TripCalendarComponent) private tripCalendar?: TripCalendarComponent;

  readonly showSummary = signal(false);
  readonly openDogs = signal<string[]>(['0']);

  readonly dogPhotoFiles = new Map<AbstractControl, File>();
  readonly dogDocumentFiles = new Map<AbstractControl, File>();

  readonly selectedDateLocal = signal<string | null>(null);

  readonly calendarEvents  = toSignal(this.store.select(selectTripsAsCalendarEvents), { initialValue: [] as CalendarEvent[] });
  private readonly allTrips = toSignal(this.store.select(selectAllTrips), { initialValue: [] });
  readonly selectedTrip    = computed(() => {
    const date = this.selectedDateLocal();
    return date ? (this.allTrips().find((trip) => trip.date === date) ?? null) : null;
  });
  readonly pickupDestinations = computed((): TripDestination[] => {
    const trip = this.selectedTrip();
    if (!trip) return [];
    return trip.pickupLocations ?? [];
  });
  readonly loading         = toSignal(this.store.select(selectTripsIsLoading),         { initialValue: false });
  readonly submitting      = toSignal(this.store.select(selectTripRequestIsLoading), { initialValue: false });
  readonly success         = toSignal(this.store.select(selectTripRequestIsSuccess),   { initialValue: false });
  readonly error           = toSignal(this.store.select(selectTripRequestError),       { initialValue: null as string | null });

  readonly form = this.fb.group({
    requesterName:  [devSeed(RandomProperty.requesterNames),  Validators.required],
    requesterEmail: [devSeed(RandomProperty.requesterEmails), [Validators.required, Validators.email]],
    requesterPhone: [devSeed(RandomProperty.requesterPhones.map((number) => `+30 ${number}`)), Validators.required],
    dogs: this.fb.array([this.dogGroup()]),
  });

  readonly formInvalid = toSignal(
    this.form.statusChanges.pipe(map(() => this.form.invalid)),
    { initialValue: this.form.invalid },
  );

  readonly nextAvailableTrip = toSignal(this.store.select(selectNextAvailableTrip), { initialValue: null });

  private readonly dogsStatus = toSignal(this.dogs.statusChanges, { initialValue: this.dogs.status });
  private readonly contactValid = toSignal(
    this.form.statusChanges.pipe(
      map(() =>
        (this.form.get('requesterName')?.valid ?? false) &&
        (this.form.get('requesterEmail')?.valid ?? false) &&
        (this.form.get('requesterPhone')?.valid ?? false),
      ),
    ),
    {
      initialValue:
        (this.form.get('requesterName')?.valid ?? false) &&
        (this.form.get('requesterEmail')?.valid ?? false) &&
        (this.form.get('requesterPhone')?.valid ?? false),
    },
  );

  readonly calendarDone = computed(() => !!this.selectedTrip());
  readonly dogsDone = computed(() => this.dogsStatus() === 'VALID');
  readonly contactDone = computed(() => this.contactValid());

  constructor() {
    this.actions$.pipe(
      ofType(submitRequestSuccess),
      takeUntilDestroyed(),
    ).subscribe(() => {
      this.onReset();
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }

  get dogs(): FormArray { return this.form.get('dogs') as FormArray; }
  get dogControls(): FormGroup[] { return this.dogs.controls as FormGroup[]; }

  onAccordionValueChange(value: string | string[] | undefined | null): void {
    if (Array.isArray(value)) this.openDogs.set(value);
    else this.openDogs.set(value ? [value] : []);
  }

  dogGroup() {
    return this.fb.group({
      name:           [devSeed(RandomProperty.dogNames, null), Validators.required],
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

  onDogPhotoChange(group: AbstractControl, file: File | null): void {
    if (file) {
      this.dogPhotoFiles.set(group, file);
    } else {
      this.dogPhotoFiles.delete(group);
    }
  }

  onDogDocumentChange(group: AbstractControl, file: File | null): void {
    if (file) {
      this.dogDocumentFiles.set(group, file);
    } else {
      this.dogDocumentFiles.delete(group);
    }
  }

  addDog(): void {
    this.dogs.push(this.dogGroup());
    const newIndex = (this.dogs.length - 1).toString();
    this.openDogs.update(prev => [...prev, newIndex]);
    this.showSummary.set(false);
  }

  removeDog(index: number): void {
    this.confirmationService.confirm({
      header: this.transloco.translate('tripRequest.removeDog'),
      message: this.transloco.translate('tripRequest.dogNum', { num: index + 1 }),
      acceptLabel: this.transloco.translate('tripRequest.remove'),
      rejectLabel: this.transloco.translate('tripRequest.collapse'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const removed = this.dogs.at(index);
        this.dogPhotoFiles.delete(removed);
        this.dogDocumentFiles.delete(removed);
        this.dogs.removeAt(index);
        this.showSummary.set(false);
        this.openDogs.update(prev =>
          prev
            .filter(key => key !== index.toString())
            .map(key => +key > index ? (+key - 1).toString() : key),
        );
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
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => this.onDateSelected(next.date));
    });
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
          this.selectedDateLocal.set(date);
          this.scrollToDogForm();
        },
      });
    } else {
      this.selectedDateLocal.set(date);
      this.scrollToDogForm();
    }
  }

  private scrollToDogForm(): void {
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => this.dogsSection?.nativeElement.scrollIntoView({ block: 'center' }));
    });
  }

  private resetDogs(): void {
    this.dogs.clear();
    this.dogs.push(this.dogGroup());
    this.dogs.markAsPristine();
    this.openDogs.set(['0']);
    this.dogPhotoFiles.clear();
    this.dogDocumentFiles.clear();
    this.showSummary.set(false);
  }

  preview(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.openInvalidDogPanels();
      return;
    }
    this.showSummary.set(true);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.openInvalidDogPanels();
      this.cdr.detectChanges();
      return;
    }
    const trip = this.selectedTrip();
    if (!trip) return;

    const { requesterName, requesterEmail, requesterPhone } = this.form.value;
    const dogs = this.form.value.dogs as Record<string, unknown>[];
    const dogFiles: DogFiles[] = this.dogs.controls.map((group) => ({
      photo: this.dogPhotoFiles.get(group) ?? null,
      document: this.dogDocumentFiles.get(group) ?? null,
    }));

    this.store.dispatch(submitRequest({
      dogs,
      dogFiles,
      tripId: trip.id,
      requesterName: requesterName!,
      requesterEmail: requesterEmail!,
      requesterPhone: (requesterPhone ?? '').trim(),
    }));
  }

  private openInvalidDogPanels(): void {
    const open = new Set(this.openDogs());
    this.dogs.controls.forEach((control, i) => {
      if (control.invalid) open.add(i.toString());
    });
    this.openDogs.set([...open]);
  }

  onReset(): void {
    this.form.reset();
    this.dogs.clear();
    this.dogs.push(this.dogGroup());
    this.showSummary.set(false);
    this.openDogs.set(['0']);
    this.dogPhotoFiles.clear();
    this.dogDocumentFiles.clear();
    this.store.dispatch(resetRequest());
    this.selectedDateLocal.set(null);
  }
}
