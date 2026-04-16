import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Store } from '@ngrx/store';
import { filter, map, take } from 'rxjs';
import { clearSelectedTrip, loadTripById, updateTrip, addTrip, selectSelectedTrip, selectTripsMutating } from '@admin/features/trips/store';
import { Dog } from '@models/lib/dog.model';
import { DogDetailDialogComponent } from '@admin/features/trips/components/dog-detail-dialog/dog-detail-dialog.component';
import { DogManagerService } from './dog-manager.service';
import { DogDialogService } from './dog-dialog.service';
import { TripFormHeaderComponent } from './trip-form-header/trip-form-header.component';
import { TripInfoFormComponent } from './trip-info-form/trip-info-form.component';
import { TripDogsManagerComponent } from './trip-dogs-manager/trip-dogs-manager.component';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DogDialogService, DogManagerService],
  imports: [
    RouterModule, ReactiveFormsModule,
    ButtonModule, ToastModule, ConfirmDialogModule,
    TranslocoModule,
    DogDetailDialogComponent,
    TripFormHeaderComponent,
    TripInfoFormComponent,
    TripDogsManagerComponent,
  ],
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss'],
})
export class TripFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);
  readonly dogManager = inject(DogManagerService);

  form!: FormGroup;
  isEdit = false;
  editId: string | null = null;

  today = new Date();
  readonly mutating = toSignal(this.store.select(selectTripsMutating), { initialValue: false });

  readonly statuses = toSignal(
    this.transloco.selectTranslation().pipe(
      map(() => [
        { label: this.transloco.translate('trips.form.statusUpcoming'), value: 'upcoming' },
        { label: this.transloco.translate('trips.form.statusInProgress'), value: 'in-progress' },
        { label: this.transloco.translate('trips.form.statusCompleted'), value: 'completed' },
      ]),
    ),
    { initialValue: [] as { label: string; value: string }[] },
  );

  selectedDog: Dog | null = null;
  dogDetailVisible = false;

  ngOnInit(): void {
    this.editId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.editId;

    this.buildForm();
    this.dogManager.init(this.isEdit, this.editId);
    this.store.dispatch(clearSelectedTrip());

    if (this.isEdit && this.editId) {
      this.loadTripForEdit();
    } else {
      const prefilledDate = this.route.snapshot.queryParamMap.get('date');
      if (prefilledDate) {
        this.form.patchValue({ date: new Date(prefilledDate + 'T00:00:00') });
      }
    }
  }

  private buildForm(): void {
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
      dogs: this.dogManager.dogsArray,
    });
  }

  private loadTripForEdit(): void {
    this.store.dispatch(loadTripById({ id: this.editId! }));

    const trip$ = this.store.select(selectSelectedTrip).pipe(filter(Boolean));

    trip$.pipe(take(1)).subscribe((trip) => {
      this.form.patchValue({ ...trip, date: trip.date ? new Date(trip.date + 'T00:00:00') : null });
    });

    trip$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((trip) => {
      this.dogManager.setDogs(trip.dogs ?? [], trip.requesters ?? []);
    });
  }

  get dogs(): FormArray { return this.dogManager.dogsArray; }

  get isAtCapacity(): boolean {
    return this.dogs.length >= (this.form.get('totalCapacity')?.value ?? 0);
  }

  get capacityWarning(): string | null {
    const capacity = this.form.get('totalCapacity')?.value ?? 0;
    if (capacity < this.dogs.length) {
      return this.transloco.translate('trips.form.capacityWarning', { capacity, dogs: this.dogs.length });
    }
    return null;
  }

  openDogDetail(dog: Dog): void {
    this.selectedDog = dog;
    this.dogDetailVisible = true;
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
      const dogs = (this.dogManager.dogsArray.value as Dog[]).map(({ id: _id, ...rest }) => rest);
      this.store.dispatch(addTrip({ trip: payload, dogs: dogs.length ? dogs : undefined }));
    }
  }
}
