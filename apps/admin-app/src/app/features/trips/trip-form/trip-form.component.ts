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
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';
import { TripActions, selectSelectedTrip, selectTripsMutating, selectTripsError } from '@admin/store/trips';
import { Dog } from '@models/lib/dog.model';
import { generateId } from '@models/lib/utils';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, SelectModule, ButtonModule, CardModule,
    IftaLabelModule, TextareaModule, DatePickerModule,
    MessageModule, ToastModule, DialogModule, TooltipModule, CheckboxModule,
  ],
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss'],
})
export class TripFormComponent implements OnInit {
  form!: FormGroup;
  dogEditForm!: FormGroup;
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

  sizes = [
    { value: 'small', label: 'Small (< 10 kg)' },
    { value: 'medium', label: 'Medium (10–25 kg)' },
    { value: 'large', label: 'Large (> 25 kg)' },
  ];

  dogDialogVisible = false;
  editingDogIndex: number | null = null;
  isNewDog = false;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
  ) {
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

    this.store.dispatch(TripActions.clearSelectedTrip());

    if (this.isEdit && this.editId) {
      this.store.dispatch(TripActions.loadTripById({ id: this.editId }));
      this.store.select(selectSelectedTrip).pipe(
        filter(Boolean),
        take(1)
      ).subscribe((trip) => {
        this.form.patchValue({ ...trip, date: trip.date ? new Date(trip.date + 'T00:00:00') : null });
        this.dogs.clear();
        trip.dogs.forEach((d) => this.dogs.push(this.dogGroup(d)));
      });
    }
  }

  get dogs(): FormArray { return this.form.get('dogs') as FormArray; }

  /** True when dogs have reached/exceeded capacity — isFull is auto-locked and uneditable */
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

  private buildDogEditForm(values: Partial<Dog>): FormGroup {
    return this.fb.group({
      id: [values.id ?? ''],
      name: [values.name ?? '', Validators.required],
      size: [values.size ?? '', Validators.required],
      age: [values.age ?? 0, [Validators.required, Validators.min(0)]],
      chipId: [values.chipId ?? '', [Validators.required, Validators.pattern(/^\d{15}$/)]],
      pickupLocation: [values.pickupLocation ?? '', Validators.required],
      dropLocation: [values.dropLocation ?? '', Validators.required],
      notes: [values.notes ?? ''],
    });
  }

  addDog(): void {
    const newId = generateId();
    this.dogs.push(this.dogGroup({ id: newId }));
    this.editingDogIndex = this.dogs.length - 1;
    this.isNewDog = true;
    this.dogEditForm = this.buildDogEditForm({ id: newId });
    this.dogDialogVisible = true;
  }

  removeDog(i: number): void { this.dogs.removeAt(i); }

  openDogDialog(index: number): void {
    this.editingDogIndex = index;
    this.isNewDog = false;
    this.dogEditForm = this.buildDogEditForm({ ...this.dogs.at(index).value });
    this.dogDialogVisible = true;
  }

  saveDogDialog(): void {
    if (this.editingDogIndex === null) return;
    this.dogEditForm.markAllAsTouched();
    if (this.dogEditForm.invalid) return;

    const values: Dog = { ...this.dogEditForm.value };

    (this.dogs.at(this.editingDogIndex) as FormGroup).patchValue(values);

    if (this.isEdit && this.editId && !this.isNewDog) {
      this.store.dispatch(TripActions.updateDog({ tripId: this.editId, dog: values }));
      this.messageService.add({ severity: 'success', summary: 'Dog Updated', detail: 'Dog updated successfully.' });
    }

    this.dogDialogVisible = false;
    this.editingDogIndex = null;
    this.isNewDog = false;
  }

  cancelDogDialog(): void {
    if (this.isNewDog && this.editingDogIndex !== null) {
      this.dogs.removeAt(this.editingDogIndex);
    }
    this.dogDialogVisible = false;
    this.editingDogIndex = null;
    this.isNewDog = false;
  }

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

    const dogs: Dog[] = this.form.value.dogs.map((d: Partial<Dog>) => ({
      ...d,
      id: d.id || generateId(),
    }));
    const rawDate = this.form.value.date as Date | null;
    const dateStr = rawDate
      ? `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(rawDate.getDate()).padStart(2, '0')}`
      : '';
    const totalCapacity: number = this.form.value.totalCapacity;
    const spotsAvailable = Math.max(0, totalCapacity - dogs.length);
    const payload = { ...this.form.value, date: dateStr, totalCapacity, spotsAvailable, dogs };

    if (this.isEdit && this.editId) {
      this.store.dispatch(TripActions.updateTrip({ id: this.editId, trip: payload }));
    } else {
      this.store.dispatch(TripActions.addTrip({ trip: payload }));
    }
  }
}
