import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';
import {
  TripActions,
  selectSelectedTrip, selectTripsMutating, selectTripsError,
} from '@myorg/store';
import { DogFormComponent, LoadingSpinnerComponent } from '@myorg/ui';
import { Trip, Dog } from '@myorg/models';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    InputTextModule, SelectModule, ButtonModule, CardModule,
    IftaLabelModule, TextareaModule, DatePickerModule, MessageModule, ToastModule,
    DogFormComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss'],
})
export class TripFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  form!: FormGroup;
  isEdit = false;
  editId: string | null = null;

  today = new Date();
  mutating$ = this.store.select(selectTripsMutating);
  error$ = this.store.select(selectTripsError);

  statuses = [
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
  ];

  constructor() {
    this.error$.pipe(
      filter(Boolean),
      takeUntilDestroyed()
    ).subscribe((err) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err });
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      date: [null as Date | null, Validators.required],
      departureCountry: ['', Validators.required],
      departureCity: ['', Validators.required],
      arrivalCountry: ['', Validators.required],
      arrivalCity: ['', Validators.required],
      status: ['upcoming', Validators.required],
      notes: [''],
      dogs: this.fb.array([]),
    });

    this.editId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.editId;

    this.store.dispatch(TripActions.clearSelectedTrip());

    if (this.isEdit && this.editId) {
      this.store.dispatch(TripActions.loadTripById({ id: this.editId }));
      this.store.select(selectSelectedTrip).pipe(
        filter(Boolean),
        take(1)
      ).subscribe((trip) => {
        this.form.patchValue({ ...trip, date: trip.date ? new Date(trip.date) : null });
        this.dogs.clear();
        trip.dogs.forEach((d) => this.dogs.push(this.dogGroup(d)));
      });
    }
  }

  get dogs(): FormArray { return this.form.get('dogs') as FormArray; }

  dogGroup(dog?: Partial<Dog>): FormGroup {
    return this.fb.group({
      name: [dog?.name ?? '', Validators.required],
      size: [dog?.size ?? '', Validators.required],
      chipId: [dog?.chipId ?? '', [Validators.required, Validators.pattern(/^\d{15}$/)]],
      fromCountry: [dog?.fromCountry ?? '', Validators.required],
      fromCity: [dog?.fromCity ?? '', Validators.required],
      toCountry: [dog?.toCountry ?? '', Validators.required],
      toCity: [dog?.toCity ?? '', Validators.required],
      notes: [dog?.notes ?? ''],
    });
  }

  addDog(): void { this.dogs.push(this.dogGroup()); }
  removeDog(i: number): void { this.dogs.removeAt(i); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const dogs: Dog[] = this.form.value.dogs.map((d: Partial<Dog>) => ({ ...d, id: crypto.randomUUID() }));
    const rawDate = this.form.value.date as Date | null;
    const dateStr = rawDate ? rawDate.toISOString().slice(0, 10) : '';
    const payload = { ...this.form.value, date: dateStr, dogs };

    if (this.isEdit && this.editId) {
      this.store.dispatch(TripActions.updateTrip({ id: this.editId, trip: payload }));
    } else {
      this.store.dispatch(TripActions.addTrip({ trip: payload }));
    }
  }
}
