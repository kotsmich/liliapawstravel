import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs';
import { clearSelectedTrip, loadTripById, updateTrip, addTrip, selectSelectedTrip, selectTripsMutating, selectTripsError } from '@admin/features/trips/store';
import { Dog } from '@models/lib/dog.model';
import { DogFormDialogComponent } from '@admin/features/trips/components/dog-form-dialog/dog-form-dialog.component';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, SelectModule, ButtonModule, CardModule,
    IftaLabelModule, TextareaModule, DatePickerModule,
    MessageModule, ToastModule, TooltipModule, CheckboxModule,
    DogFormDialogComponent,
  ],
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss'],
})
export class TripFormComponent implements OnInit {
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

  dogDialogVisible = false;
  editingDogIndex: number | null = null;
  selectedDog: Dog | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      date: [null as Date | null, Validators.required],
      departureCountry: ['', Validators.required],
      departureCity: ['', Validators.required],
      arrivalCountry: ['', Validators.required],
      arrivalCity: ['', Validators.required],
      status: ['upcoming', Validators.required],
      totalCapacity: [null, [Validators.required, Validators.min(1)]],
      notes: [''],
      isFull: [false],
      acceptingRequests: [true],
      dogs: this.fb.array([]),
    });

    this.editId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.editId;

    const prefilledDate = this.route.snapshot.queryParamMap.get('date');
    if (prefilledDate && !this.isEdit) {
      this.form.patchValue({ date: new Date(prefilledDate + 'T00:00:00') });
    }

    this.store.dispatch(clearSelectedTrip());

    if (this.isEdit && this.editId) {
      this.store.dispatch(loadTripById({ id: this.editId }));
      this.store.select(selectSelectedTrip).pipe(
        filter(Boolean),
        take(1)
      ).subscribe((trip) => {
        this.form.patchValue({ ...trip, date: trip.date ? new Date(trip.date + 'T00:00:00') : null });
        this.dogs.clear();
        trip.dogs?.forEach((d) => this.dogs.push(this.dogGroup(d)));
      });
    }
  }

  get dogs(): FormArray { return this.form.get('dogs') as FormArray; }

  get isAtCapacity(): boolean {
    return this.dogs.length >= (this.form.get('totalCapacity')?.value ?? 0);
  }

  dogGroup(dog?: Partial<Dog>): FormGroup {
    return this.fb.group({
      id: [dog?.id ?? ''],
      name: [dog?.name ?? ''],
      size: [dog?.size ?? ''],
      age: [dog?.age ?? 0],
      chipId: [dog?.chipId ?? ''],
      pickupLocation: [dog?.pickupLocation ?? ''],
      dropLocation: [dog?.dropLocation ?? ''],
      notes: [dog?.notes ?? ''],
    });
  }

  openAddDogDialog(): void {
    this.selectedDog = null;
    this.editingDogIndex = null;
    this.dogDialogVisible = true;
  }

  openEditDogDialog(index: number): void {
    this.selectedDog = { ...this.dogs.at(index).value } as Dog;
    this.editingDogIndex = index;
    this.dogDialogVisible = true;
  }

  onDogSaved(dog: Dog): void {
    if (this.editingDogIndex !== null) {
      (this.dogs.at(this.editingDogIndex) as FormGroup).patchValue(dog);
    } else {
      this.dogs.push(this.dogGroup(dog));
    }
    this.dogDialogVisible = false;
    this.selectedDog = null;
    this.editingDogIndex = null;
  }

  onDogDialogCancelled(): void {
    this.dogDialogVisible = false;
    this.selectedDog = null;
    this.editingDogIndex = null;
  }

  removeDog(i: number): void { this.dogs.removeAt(i); }

  get capacityWarning(): string | null {
    const capacity = this.form.get('totalCapacity')?.value ?? 0;
    if (capacity < this.dogs.length) {
      return `Capacity (${capacity}) is below current dogs (${this.dogs.length}) — trip will be auto-marked Full.`;
    }
    return null;
  }

  navigateToTrips(): void {
    this.router.navigate(['/admin/trips']);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const rawDate = this.form.value.date as Date | null;
    const dateStr = rawDate
      ? `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(rawDate.getDate()).padStart(2, '0')}`
      : '';
    const totalCapacity: number = this.form.value.totalCapacity;
    const { isFull: _isFull, dogs: _dogs, ...rest } = this.form.value;
    const payload = { ...rest, date: dateStr, totalCapacity };

    if (this.isEdit && this.editId) {
      this.store.dispatch(updateTrip({ id: this.editId, trip: payload }));
    } else {
      this.store.dispatch(addTrip({ trip: payload }));
    }
  }
}
