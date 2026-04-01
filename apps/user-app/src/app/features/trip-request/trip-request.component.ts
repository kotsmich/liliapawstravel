import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { Store } from '@ngrx/store';
import { ConfirmationService } from 'primeng/api';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DogFormComponent } from '@ui/lib/dog-form/dog-form.component';
import { TripCalendarComponent } from '@ui/lib/trip-calendar/trip-calendar.component';
import { ToastNotificationComponent } from '@ui/lib/toast-notification/toast-notification.component';
import { CalendarEvent } from '@models/lib/calendar-event.model';
import { generateId } from '@models/lib/utils';
import { Trip } from '@models/lib/trip.model';
import { Dog } from '@models/lib/dog.model';
import { clearSelectedTrip, selectTripsAsCalendarEvents, selectTripsIsLoading } from '@user/core/store/trips';
import { selectDate, clearDate, selectCalendarSelectedDate, selectTripForSelectedDate } from '@user/core/store/calendar';
import { submitRequest, resetRequest, selectTripRequestIsLoading, selectTripRequestIsSuccess, selectTripRequestError } from '@user/features/trip-request/store';

@Component({
  selector: 'app-trip-request',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    ButtonModule, CardModule, DividerModule, MessageModule, ConfirmDialogModule,
    InputTextModule, IftaLabelModule, SkeletonModule, TagModule,
    DogFormComponent, TripCalendarComponent, ToastNotificationComponent,
  ],
  templateUrl: './trip-request.component.html',
  styleUrls: ['./trip-request.component.scss'],
})
export class TripRequestComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly viewportScroller = inject(ViewportScroller);

  form!: FormGroup;
  showSummary = false;
  expandedIndex: number | null = 0;

  // Signals for local state synced from the store — no manual subscriptions needed
  readonly calendarEvents = toSignal(this.store.select(selectTripsAsCalendarEvents), { initialValue: [] as CalendarEvent[] });
  readonly selectedDateLocal = toSignal(this.store.select(selectCalendarSelectedDate), { initialValue: null as string | null });
  readonly selectedTrip = toSignal(this.store.select(selectTripForSelectedDate), { initialValue: null as Trip | null });

  // Observables kept for async-pipe usage in the template
  loading$ = this.store.select(selectTripsIsLoading);
  selectedTrip$ = this.store.select(selectTripForSelectedDate);
  submitting$ = this.store.select(selectTripRequestIsLoading);
  success$ = this.store.select(selectTripRequestIsSuccess);
  error$ = this.store.select(selectTripRequestError);

  constructor() {
    // React to successful submission
    // Toast handled by NotificationEffects — reset form and scroll on success
    this.success$.pipe(
      filter(Boolean),
      takeUntilDestroyed(),
    ).subscribe(() => {
      this.onReset();
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      requesterName: ['joanna', Validators.required],
      requesterEmail: ['konstantinos.mich91@gmail.com', [Validators.required, Validators.email]],
      requesterPhone: ['09065656565', Validators.required],
      dogs: this.fb.array([this.dogGroup()]),
    });
  }

  get dogs(): FormArray { return this.form.get('dogs') as FormArray; }

  dogGroup(): FormGroup {
    return this.fb.group({
      name: ['tztzifiogos', Validators.required],
      size: ['medium', Validators.required],
      age: [4, [Validators.required, Validators.min(0)]],
      chipId: ['123456789123456', [Validators.required, Validators.pattern(/^\d{15}$/)]],
      pickupLocation: ['katerini', Validators.required],
      dropLocation: ['germany', Validators.required],
      notes: ['Not something special'],
    });
  }

  addDog(): void {
    this.dogs.push(this.dogGroup());
    this.expandedIndex = this.dogs.length - 1;
    this.showSummary = false;
  }

  removeDog(index: number): void {
    this.confirmationService.confirm({
      header: 'Remove Dog',
      message: `Remove Dog ${index + 1} from this request?`,
      acceptLabel: 'Remove',
      rejectLabel: 'Cancel',
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
    const dogs: Dog[] = this.form.value.dogs.map((d: Partial<Dog>) => ({
      ...d, id: generateId(),
    }));
    this.store.dispatch(submitRequest({
      dogs,
      tripId: this.selectedTrip()!.id,
      requesterName,
      requesterEmail,
      requesterPhone,
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
