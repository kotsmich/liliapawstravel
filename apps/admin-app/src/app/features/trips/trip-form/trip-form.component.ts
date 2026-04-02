import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs';
import { clearSelectedTrip, loadTripById, updateTrip, addTrip, addDogs, updateDog, deleteDog, deleteDogs, selectSelectedTrip, selectTripsMutating, selectTripsError } from '@admin/features/trips/store';
import { Dog } from '@models/lib/dog.model';
import { DogFormDialogComponent } from '@admin/features/trips/components/dog-form-dialog/dog-form-dialog.component';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, SelectModule, ButtonModule, CardModule,
    IftaLabelModule, TextareaModule, DatePickerModule,
    MessageModule, ToastModule, TooltipModule, CheckboxModule, ConfirmDialogModule,
    DogFormDialogComponent,
    GenericTableComponent,
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
  selectedDogs: (Dog & { _idx: number })[] = [];

  dogColumns: TableColumn<Dog & { _idx: number }>[] = [
    { field: 'name', header: 'Name', sortable: true },
    {
      field: 'size', header: 'Size', type: 'badge',
      badgeConfig: {
        severity: (v) => v === 'small' ? 'success' : v === 'medium' ? 'warn' : 'danger',
        label: (v) => String(v ?? ''),
      },
    },
    { field: 'age', header: 'Age', formatter: (v) => v != null ? `${v} yr` : '—' },
    { field: 'pickupLocation', header: 'Pickup' },
    { field: 'dropLocation', header: 'Drop' },
    { field: 'chipId', header: 'Chip ID' },
    { field: 'requesterName', header: 'Requester', formatter: (v) => String(v ?? '—') },
  ];

  dogTableConfig: TableConfig = {
    selectable: true,
    striped: true,
    trackByField: '_idx',
    emptyMessage: 'No dogs added yet. Use the "Add Dog" button above.',
  };

  dogActions: TableAction<Dog & { _idx: number }>[] = [
    { icon: 'pi pi-pencil', tooltip: 'Edit dog', severity: 'secondary', action: (row) => this.openEditDogDialog(row._idx) },
    { icon: 'pi pi-trash', tooltip: 'Remove dog', severity: 'danger', action: (row) => this.removeDog(row._idx) },
  ];

  dogsData: (Dog & { _idx: number })[] = [];

  private refreshDogsData(): void {
    this.dogsData = this.dogs.controls.map((ctrl, i) => ({ ...ctrl.value, _idx: i }));
  }

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
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

    if (!this.isEdit) {
      const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
      const date = new Date();
      date.setDate(date.getDate() + pick([7, 10, 14, 21, 30]));
      this.form.patchValue({
        date,
        departureCountry: pick(['Greece', 'Romania', 'Bulgaria']),
        departureCity:    pick(['Thessaloniki', 'Athens', 'Bucharest', 'Sofia']),
        arrivalCountry:   pick(['Austria', 'Netherlands', 'Germany']),
        arrivalCity:      pick(['Vienna', 'Amsterdam', 'Berlin', 'Munich']),
        totalCapacity:    pick([25, 35, 45, 55]),
      });
    }

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
        this.refreshDogsData();
        this.cdr.markForCheck();
      });
    }
  }

  get dogs(): FormArray { return this.form.get('dogs') as FormArray; }

  get isAtCapacity(): boolean {
    return this.dogs.length >= (this.form.get('totalCapacity')?.value ?? 0);
  }

  dogGroup(dog?: Partial<Dog>): FormGroup {
    return this.fb.group({
      id:             [dog?.id             ?? ''],
      name:           [dog?.name           ?? 'promaxonas'],
      size:           [dog?.size           ?? 'small'],
      age:            [dog?.age            ?? 1],
      chipId:         [dog?.chipId         ?? '111111111111222'],
      pickupLocation: [dog?.pickupLocation ?? 'thessaloniki'],
      dropLocation:   [dog?.dropLocation   ?? 'austria'],
      notes:          [dog?.notes          ?? 'Needs somethign else'],
      requesterName:  [dog?.requesterName  ?? 'dimitra'],
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

  onDogSaved(dogs: Dog[]): void {
    if (this.editingDogIndex !== null) {
      const dog = dogs[0];
      if (this.isEdit && this.editId && dog.id) {
        this.store.dispatch(updateDog({ tripId: this.editId, dog }));
      }
      (this.dogs.at(this.editingDogIndex) as FormGroup).patchValue(dog);
    } else {
      if (this.editId) {
        const payload = dogs.map(({ id: _id, ...rest }) => rest);
        this.store.dispatch(addDogs({ tripId: this.editId, dogs: payload }));
      }
      dogs.forEach((dog) => this.dogs.push(this.dogGroup(dog)));
    }
    this.refreshDogsData();
    this.dogDialogVisible = false;
    this.selectedDog = null;
    this.editingDogIndex = null;
  }

  onDogDialogCancelled(): void {
    this.dogDialogVisible = false;
    this.selectedDog = null;
    this.editingDogIndex = null;
  }

  removeDog(i: number): void {
    const dog = this.dogs.at(i).value as Dog;
    const doRemove = () => {
      this.dogs.removeAt(i);
      const capacity = this.form.get('totalCapacity')?.value ?? 0;
      if (this.dogs.length < capacity) {
        this.form.patchValue({ isFull: false }, { emitEvent: false });
      }
      this.refreshDogsData();
    };
    if (this.isEdit && this.editId && dog.id) {
      this.confirmationService.confirm({
        header: 'Remove Dog',
        message: `Remove <strong>${dog.name}</strong> from this trip? This cannot be undone.`,
        acceptLabel: 'Remove',
        rejectLabel: 'Cancel',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => {
          this.store.dispatch(deleteDog({ tripId: this.editId!, dogId: dog.id }));
          doRemove();
        },
      });
    } else {
      doRemove();
    }
  }

  removeSelectedDogs(): void {
    const toRemove = [...this.selectedDogs];
    if (!toRemove.length) return;

    const doRemove = () => {
      const dogIdsToDelete = toRemove.map((d) => d.id).filter((id): id is string => !!id);
      if (this.isEdit && this.editId && dogIdsToDelete.length) {
        this.store.dispatch(deleteDogs({ tripId: this.editId, dogIds: dogIdsToDelete }));
      }
      const indices = toRemove.map((d) => d._idx).sort((a, b) => b - a);
      indices.forEach((i) => this.dogs.removeAt(i));
      const capacity = this.form.get('totalCapacity')?.value ?? 0;
      if (this.dogs.length < capacity) {
        this.form.patchValue({ isFull: false }, { emitEvent: false });
      }
      this.refreshDogsData();
      this.selectedDogs = [];
    };

    if (this.isEdit && toRemove.some((d) => d.id)) {
      this.confirmationService.confirm({
        header: 'Remove Dogs',
        message: `Remove <strong>${toRemove.length}</strong> dog(s) from this trip? This cannot be undone.`,
        acceptLabel: 'Remove',
        rejectLabel: 'Cancel',
        acceptButtonStyleClass: 'p-button-danger',
        accept: doRemove,
      });
    } else {
      doRemove();
    }
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
      const dogs = (this.dogs.value as Dog[]).map(({ id: _id, ...rest }) => rest);
      this.store.dispatch(addTrip({ trip: payload, dogs: dogs.length ? dogs : undefined }));
    }
  }
}
