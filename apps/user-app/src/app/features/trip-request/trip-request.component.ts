import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { Store } from '@ngrx/store';
import { MessageService, ConfirmationService } from 'primeng/api';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DogFormComponent, TripCalendarComponent, LoadingSpinnerComponent, ToastNotificationComponent } from '@myorg/ui';
import { CalendarEvent, Trip, Dog } from '@myorg/models';
import {
  CalendarActions,
  TripActions,
  TripRequestActions,
  selectAllEvents,
  selectCalendarIsLoading,
  selectCalendarSelectedDate,
  selectSelectedTrip,
  selectTripRequestIsLoading,
  selectTripRequestIsSuccess,
  selectTripRequestHasError,
} from '@myorg/store';

@Component({
  selector: 'app-trip-request',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    ButtonModule, DividerModule, MessageModule, ConfirmDialogModule,
    InputTextModule, IftaLabelModule,
    DogFormComponent, TripCalendarComponent, LoadingSpinnerComponent, ToastNotificationComponent,
  ],
  templateUrl: './trip-request.component.html',
  styleUrls: ['./trip-request.component.scss'],
})
export class TripRequestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private doc = inject(DOCUMENT);

  form!: FormGroup;
  showSummary = false;
  selectedDateLocal: string | null = null;
  calendarEvents: CalendarEvent[] = [];
  selectedTrip: Trip | null = null;

  loading$ = this.store.select(selectCalendarIsLoading);
  selectedDate$ = this.store.select(selectCalendarSelectedDate);
  selectedTrip$ = this.store.select(selectSelectedTrip);
  submitting$ = this.store.select(selectTripRequestIsLoading);
  success$ = this.store.select(selectTripRequestIsSuccess);
  error$ = this.store.select(selectTripRequestHasError);
  events$ = this.store.select(selectAllEvents);

  ngOnInit(): void {
    this.store.dispatch(CalendarActions.loadEvents());
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
      size: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(0)]],
      chipId: ['', [Validators.required, Validators.pattern(/^\d{15}$/)]],
      pickupLocation: ['', Validators.required],
      dropLocation: ['', Validators.required],
      notes: [''],
    });
  }

  addDog(): void { this.dogs.push(this.dogGroup()); this.showSummary = false; }

  confirmRemoveDog(index: number): void {
    this.confirmationService.confirm({
      header: 'Remove Dog',
      message: `Remove Dog ${index + 1} from this request?`,
      acceptLabel: 'Remove',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.dogs.removeAt(index);
        this.showSummary = false;
      },
    });
  }

  onDateSelected(date: string): void {
    this.store.dispatch(CalendarActions.selectDate({ date }));
    const event = this.calendarEvents.find((e) => e.date === date);
    if (event) {
      this.store.dispatch(TripActions.loadTripById({ id: event.tripId }));
    } else {
      this.store.dispatch(TripActions.clearSelectedTrip());
    }
  }

  preview(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.showSummary = true;
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { requesterName, requesterEmail, requesterPhone } = this.form.value;
    const dogs: Dog[] = this.form.value.dogs.map((d: Partial<Dog>) => ({
      ...d, id: crypto.randomUUID(),
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
    this.showSummary = false;
    this.store.dispatch(TripRequestActions.resetRequest());
    this.store.dispatch(TripActions.clearSelectedTrip());
    this.store.dispatch(CalendarActions.clearDate());
  }
}
