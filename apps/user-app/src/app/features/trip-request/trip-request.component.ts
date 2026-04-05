import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DecimalPipe, ViewportScroller } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import { ConfirmationService } from 'primeng/api';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { DogFormComponent } from '@ui/lib/dog-form/dog-form.component';
import { TripCalendarComponent } from '@ui/lib/trip-calendar/trip-calendar.component';
import { ToastNotificationComponent } from '@ui/lib/toast-notification/toast-notification.component';
import { CalendarEvent } from '@models/lib/calendar-event.model';
import { RandomUtil, RandomProperty } from '@models/lib/utils';
import { clearSelectedTrip, selectTripsAsCalendarEvents, selectTripsIsLoading } from '@user/core/store/trips';
import { selectDate, clearDate, selectCalendarSelectedDate, selectTripForSelectedDate } from '@user/core/store/calendar';
import { submitRequest, resetRequest, selectTripRequestIsLoading, selectTripRequestIsSuccess, selectTripRequestError } from '@user/features/trip-request/store';

@Component({
  selector: 'app-trip-request',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, ReactiveFormsModule,
    ButtonModule, CardModule, DividerModule, MessageModule, ConfirmDialogModule,
    InputTextModule, IftaLabelModule, ProgressSpinnerModule, TagModule,
    DogFormComponent, TripCalendarComponent, ToastNotificationComponent, TranslocoModule, TooltipModule,
  ],
  templateUrl: './trip-request.component.html',
  styleUrls: ['./trip-request.component.scss'],
})
export class TripRequestComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly transloco = inject(TranslocoService);

  showSummary = false;
  expandedIndex: number | null = 0;

  readonly calendarEvents  = toSignal(this.store.select(selectTripsAsCalendarEvents), { initialValue: [] as CalendarEvent[] });
  readonly selectedDateLocal = toSignal(this.store.select(selectCalendarSelectedDate), { initialValue: null as string | null });
  readonly selectedTrip    = toSignal(this.store.select(selectTripForSelectedDate),   { initialValue: null });
  readonly loading         = toSignal(this.store.select(selectTripsIsLoading),         { initialValue: false });
  readonly submitting      = toSignal(this.store.select(selectTripRequestIsLoading),   { initialValue: false });
  readonly success         = toSignal(this.store.select(selectTripRequestIsSuccess),   { initialValue: false });
  readonly error           = toSignal(this.store.select(selectTripRequestError),       { initialValue: null as string | null });

  readonly form = this.fb.group({
    requesterName:  [RandomUtil.pick(RandomProperty.requesterNames),  Validators.required],
    requesterEmail: [RandomUtil.pick(RandomProperty.requesterEmails), [Validators.required, Validators.email]],
    requesterPhone: [RandomUtil.pick(RandomProperty.requesterPhones), Validators.required],
    dogs: this.fb.array([this.dogGroup()]),
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
      name:           [RandomUtil.pick(RandomProperty.dogNames),        Validators.required],
      size:           [RandomUtil.pick(RandomProperty.sizes),           Validators.required],
      gender:         [RandomUtil.pick(RandomProperty.genders),         Validators.required],
      age:            [RandomUtil.pick(RandomProperty.ages),            [Validators.required, Validators.min(0)]],
      chipId:         [RandomUtil.pick(RandomProperty.chipIds),         [Validators.required, Validators.pattern(/^\d{15}$/)]],
      pickupLocation: [RandomUtil.pick(RandomProperty.pickupLocations), Validators.required],
      dropLocation:   [RandomUtil.pick(RandomProperty.dropLocations),   Validators.required],
      notes:          [RandomUtil.pick(RandomProperty.notes)],
    });
  }

  addDog(): void {
    this.dogs.push(this.dogGroup());
    this.expandedIndex = this.dogs.length - 1;
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
        if (this.expandedIndex === index) {
          this.expandedIndex = null;
        } else if (this.expandedIndex !== null && this.expandedIndex > index) {
          this.expandedIndex -= 1;
        }
      },
    });
  }

  onDateSelected(date: string): void {
    this.store.dispatch(selectDate({ date }));
  }

  preview(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.showSummary = true;
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { requesterName, requesterEmail, requesterPhone } = this.form.value;
    this.store.dispatch(submitRequest({
      dogs: this.form.value.dogs!,
      tripId: this.selectedTrip()!.id,
      requesterName: requesterName!,
      requesterEmail: requesterEmail!,
      requesterPhone: requesterPhone!,
    }));
  }

  onReset(): void {
    this.form.reset();
    this.dogs.clear();
    this.dogs.push(this.dogGroup());
    this.expandedIndex = 0;
    this.showSummary = false;
    this.store.dispatch(resetRequest());
    this.store.dispatch(clearSelectedTrip());
    this.store.dispatch(clearDate());
  }
}
