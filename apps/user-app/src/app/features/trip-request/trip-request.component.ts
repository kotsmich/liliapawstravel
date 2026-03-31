import { Component, OnInit, DestroyRef, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
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
import { MessageService, ConfirmationService } from 'primeng/api';
import { filter } from 'rxjs/operators';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DogFormComponent } from '@ui/lib/dog-form/dog-form.component';
import { TripCalendarComponent } from '@ui/lib/trip-calendar/trip-calendar.component';
import { ToastNotificationComponent } from '@ui/lib/toast-notification/toast-notification.component';
import { CalendarEvent } from '@models/lib/calendar-event.model';
import { generateId } from '@models/lib/utils';
import { Trip } from '@models/lib/trip.model';
import { Dog } from '@models/lib/dog.model';
import { TripActions, selectTripsAsCalendarEvents, selectTripsIsLoading } from '@user/store/trips';
import { CalendarActions, selectCalendarSelectedDate, selectTripForSelectedDate } from '@user/store/calendar';
import { TripRequestActions, selectTripRequestIsLoading, selectTripRequestIsSuccess, selectTripRequestError } from '@user/store/trip-request';

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
  constructor(
    private fb: FormBuilder,
    private store: Store,
    private destroyRef: DestroyRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    @Inject(DOCUMENT) private doc: Document,
  ) {}

  form!: FormGroup;
  showSummary = false;
  expandedIndex: number | null = 0;
  selectedDateLocal: string | null = null;
  calendarEvents: CalendarEvent[] = [];
  selectedTrip: Trip | null = null;

  loading$ = this.store.select(selectTripsIsLoading);
  selectedDate$ = this.store.select(selectCalendarSelectedDate);
  selectedTrip$ = this.store.select(selectTripForSelectedDate);
  submitting$ = this.store.select(selectTripRequestIsLoading);
  success$ = this.store.select(selectTripRequestIsSuccess);
  error$ = this.store.select(selectTripRequestError);
  events$ = this.store.select(selectTripsAsCalendarEvents);

  ngOnInit(): void {
    timer(0, 60000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.store.dispatch(TripActions.refreshTrips());
    });
    
    this.form = this.fb.group({
      requesterName: ['', Validators.required],
      requesterEmail: ['', [Validators.required, Validators.email]],
      requesterPhone: ['', Validators.required],
      dogs: this.fb.array([this.dogGroup()]),
    });


    this.events$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((e) => {
      this.calendarEvents = e as CalendarEvent[];
    });

    this.selectedDate$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((d) => {
      this.selectedDateLocal = d;
    });

    this.selectedTrip$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((trip) => {
      this.selectedTrip = trip;
    });

    this.success$.pipe(
      filter(Boolean),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Request Submitted!',
        detail: 'Your transport request has been submitted. We\'ll confirm within 24 hours. 🐾',
        life: 5000,
      });
      this.onReset();
      this.doc.documentElement.scrollTop = 0;
    });
  }

  get dogs(): FormArray { return this.form.get('dogs') as FormArray; }

  dogGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      size: ['medium', Validators.required],
      age: [null, [Validators.required, Validators.min(0)]],
      chipId: ['', [Validators.required, Validators.pattern(/^\d{15}$/)]],
      pickupLocation: ['', Validators.required],
      dropLocation: ['', Validators.required],
      notes: [''],
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
    this.store.dispatch(CalendarActions.selectDate({ date }));
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
    this.store.dispatch(TripRequestActions.submitRequest({
      dogs,
      tripId: this.selectedTrip!.id,
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
    this.store.dispatch(TripRequestActions.resetRequest());
    this.store.dispatch(TripActions.clearSelectedTrip());
    this.store.dispatch(CalendarActions.clearDate());
  }
}
