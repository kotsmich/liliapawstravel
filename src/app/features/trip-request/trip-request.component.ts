import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CalendarActions } from '../../store/calendar/calendar.actions';
import { TripRequestActions } from '../../store/trip-request/trip-request.actions';
import {
  selectAllEvents,
  selectCalendarIsLoading,
  selectCalendarSelectedDate,
  selectEventsForSelectedDate,
} from '../../store/calendar/calendar.selectors';
import {
  selectTripRequestIsLoading,
  selectTripRequestIsSuccess,
  selectTripRequestHasError,
} from '../../store/trip-request/trip-request.selectors';
import { CalendarEvent } from '../../models';

@Component({
  selector: 'app-trip-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    ButtonModule,
    ProgressSpinnerModule,
    CardModule,
    DividerModule,
    TooltipModule,
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
  dogSizes = ['Small', 'Medium', 'Large'];

  events$ = this.store.select(selectAllEvents);
  calendarLoading$ = this.store.select(selectCalendarIsLoading);
  selectedDate$ = this.store.select(selectCalendarSelectedDate);
  filteredEvents$ = this.store.select(selectEventsForSelectedDate);
  loading$ = this.store.select(selectTripRequestIsLoading);
  success$ = this.store.select(selectTripRequestIsSuccess);
  error$ = this.store.select(selectTripRequestHasError);

  calendarGrid: { date: string; label: number; hasEvent: boolean; isPast: boolean }[] = [];
  currentMonthLabel = '';
  selectedDateLocal: string | null = null;
  allEvents: CalendarEvent[] = [];

  ngOnInit(): void {
    this.store.dispatch(CalendarActions.loadEvents());

    this.form = this.fb.group({
      dogs: this.fb.array([this.createDogGroup()]),
    });

    this.events$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((events) => {
      this.allEvents = events as CalendarEvent[];
      this.buildCalendarGrid();
    });
  }

  // ── Calendar ────────────────────────────────────────────────────────────────

  buildCalendarGrid(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    this.currentMonthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const eventDates = new Set(this.allEvents.map((e) => e.date));

    this.calendarGrid = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      this.calendarGrid.push({ date: '', label: 0, hasEvent: false, isPast: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const cellDate = new Date(dateStr);
      this.calendarGrid.push({
        date: dateStr,
        label: d,
        hasEvent: eventDates.has(dateStr),
        isPast: cellDate < today,
      });
    }
  }

  selectDate(date: string): void {
    if (!date) return;
    this.selectedDateLocal = date;
    this.store.dispatch(CalendarActions.selectDate({ date }));
  }

  // ── Dog FormArray ────────────────────────────────────────────────────────────

  get dogs(): FormArray {
    return this.form.get('dogs') as FormArray;
  }

  createDogGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      size: ['', Validators.required],
      microchipId: ['', [Validators.required, Validators.pattern(/^\d{15}$/)]],
      fromCountry: ['', Validators.required],
      fromCity: ['', Validators.required],
      toCountry: ['', Validators.required],
      toCity: ['', Validators.required],
      specialNotes: [''],
    });
  }

  addDog(): void {
    this.dogs.push(this.createDogGroup());
    this.showSummary = false;
  }

  removeDog(index: number): void {
    if (this.dogs.length > 1) {
      this.dogs.removeAt(index);
      this.showSummary = false;
    }
  }

  dogCtrl(index: number, field: string): AbstractControl {
    return this.dogs.at(index).get(field)!;
  }

  // ── Summary & Submit ─────────────────────────────────────────────────────────

  previewSummary(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.showSummary = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dogs = this.form.value.dogs.map((d: any, i: number) => ({
      ...d,
      id: crypto.randomUUID(),
    }));
    this.store.dispatch(TripRequestActions.submitTripRequest({ request: { dogs } }));
  }

  onReset(): void {
    this.form.reset();
    this.dogs.clear();
    this.dogs.push(this.createDogGroup());
    this.showSummary = false;
    this.store.dispatch(TripRequestActions.resetTripRequest());
  }

  getError(index: number, field: string): string {
    const ctrl = this.dogCtrl(index, field);
    if (!ctrl?.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return 'Required.';
    if (ctrl.errors['minlength']) return `Min ${ctrl.errors['minlength'].requiredLength} chars.`;
    if (ctrl.errors['pattern']) {
      if (field === 'microchipId') return '15-digit microchip ID required.';
      return 'Invalid format.';
    }
    return '';
  }
}
