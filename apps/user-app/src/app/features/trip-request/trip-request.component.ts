import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DogFormComponent, TripCalendarComponent, LoadingSpinnerComponent } from '@myorg/ui';
import { CalendarEvent, Dog } from '@myorg/models';
import {
  CalendarActions,
  TripRequestActions,
  selectAllEvents,
  selectCalendarIsLoading,
  selectCalendarSelectedDate,
  selectEventsForDate,
  selectTripRequestIsLoading,
  selectTripRequestIsSuccess,
  selectTripRequestHasError,
} from '@myorg/store';

@Component({
  selector: 'app-trip-request',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    ButtonModule, CardModule, DividerModule, MessageModule, TagModule,
    DogFormComponent, TripCalendarComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './trip-request.component.html',
  styleUrls: ['./trip-request.component.scss'],
})
export class TripRequestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);

  form!: FormGroup;
  showSummary = false;
  selectedDateLocal: string | null = null;
  calendarEvents: CalendarEvent[] = [];

  events$ = this.store.select(selectAllEvents);
  loading$ = this.store.select(selectCalendarIsLoading);
  selectedDate$ = this.store.select(selectCalendarSelectedDate);
  filteredEvents$ = this.store.select(selectEventsForDate);
  submitting$ = this.store.select(selectTripRequestIsLoading);
  success$ = this.store.select(selectTripRequestIsSuccess);
  error$ = this.store.select(selectTripRequestHasError);

  ngOnInit(): void {
    this.store.dispatch(CalendarActions.loadEvents());
    this.form = this.fb.group({ dogs: this.fb.array([this.dogGroup()]) });
    this.events$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((e) => {
      this.calendarEvents = e as CalendarEvent[];
    });
    this.selectedDate$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((d) => {
      this.selectedDateLocal = d;
    });
  }

  get dogs(): FormArray { return this.form.get('dogs') as FormArray; }

  dogGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      size: ['', Validators.required],
      chipId: ['', [Validators.required, Validators.pattern(/^\d{15}$/)]],
      fromCountry: ['', Validators.required],
      fromCity: ['', Validators.required],
      toCountry: ['', Validators.required],
      toCity: ['', Validators.required],
      notes: [''],
    });
  }

  addDog(): void { this.dogs.push(this.dogGroup()); this.showSummary = false; }
  removeDog(i: number): void { if (this.dogs.length > 1) { this.dogs.removeAt(i); } }

  onDateSelected(date: string): void {
    this.store.dispatch(CalendarActions.selectDate({ date }));
  }

  preview(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.showSummary = true;
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const dogs: Dog[] = this.form.value.dogs.map((d: Partial<Dog>) => ({
      ...d, id: crypto.randomUUID(),
    }));
    this.store.dispatch(TripRequestActions.submitRequest({ dogs }));
  }

  onReset(): void {
    this.form.reset();
    this.dogs.clear();
    this.dogs.push(this.dogGroup());
    this.showSummary = false;
    this.store.dispatch(TripRequestActions.resetRequest());
  }
}
