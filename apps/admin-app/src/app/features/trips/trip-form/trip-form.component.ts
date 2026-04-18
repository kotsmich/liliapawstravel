import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, inject, computed } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { Store } from '@ngrx/store';
import { filter, map, startWith } from 'rxjs';
import { clearSelectedTrip, loadTripById, updateTrip, addTrip, selectSelectedTrip, selectTripsMutating } from '@admin/features/trips/store';
import { toIsoDateStr } from '@admin/shared/utils/date';
import { Dog } from '@models/lib/dog.model';
import { TripDestination } from '@models/lib/trip.model';
import { DogDetailDialogComponent } from '@admin/features/trips/components/dog-detail-dialog/dog-detail-dialog.component';
import { DogManagerService } from './dog-manager.service';
import { DogDialogService } from './dog-dialog.service';
import { TripFormHeaderComponent } from './trip-form-header/trip-form-header.component';
import { TripInfoFormComponent } from './trip-info-form/trip-info-form.component';
import { TripDogsManagerComponent } from './trip-dogs-manager/trip-dogs-manager.component';
import { TripLocationListComponent, type LocationListConfig } from './trip-location-list/trip-location-list.component';

const DEFAULT_DESTINATIONS: TripDestination[] = [
  { id: 'def-dest-04', name: 'Μόναχο' },
  { id: 'def-dest-05', name: 'Αμβούργο' },
  { id: 'def-dest-01', name: 'Στουγκαρδη' },
  { id: 'def-dest-06', name: 'Παρίσι' },
  { id: 'def-dest-07', name: 'Άμστερνταμ' },
  { id: 'def-dest-10', name: 'Βιέννη' },
  { id: 'def-dest-11', name: 'Βρυξέλλες' },
];

const DEFAULT_PICKUP_LOCATIONS: TripDestination[] = [
  { id: 'def-pick-03', name: 'Λάρισα' },
  { id: 'def-pick-01', name: 'Κατερινη' },
  { id: 'def-pick-02', name: 'Θεσσαλονίκη' },
  { id: 'def-pick-04', name: 'Βεροια' },
  { id: 'def-pick-05', name: 'Ιωάννινα, Ελλάδα' },
];
@Component({
  selector: 'app-trip-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DogDialogService, DogManagerService],
  imports: [
    RouterModule, ReactiveFormsModule,
    ButtonModule, ToastModule, ConfirmDialogModule, InputTextModule, ChipModule,
    TranslocoModule,
    DogDetailDialogComponent,
    TripFormHeaderComponent,
    TripInfoFormComponent,
    TripDogsManagerComponent,
    TripLocationListComponent,
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

  isEdit = false;
  editId: string | null = null;
  private formPatched = false;

  readonly today = new Date();


  readonly form = this.fb.group({
    date: [new Date(), Validators.required],
    departureCountry: ['Greece', Validators.required],
    departureCity: ['Larisa', Validators.required],
    arrivalCountry: ['Calais', Validators.required],
    arrivalCity: ['France', Validators.required],
    status: ['upcoming', Validators.required],
    totalCapacity: [40, [Validators.required, Validators.min(1)]],
    notes: [''],
    isFull: [false],
    acceptingRequests: [true],
    destinations: new FormControl<TripDestination[]>(DEFAULT_DESTINATIONS, {
      validators: (c) => (c.value as TripDestination[])?.length > 0 ? null : { destinationsRequired: true },
    }),
    pickupLocations: new FormControl<TripDestination[]>(DEFAULT_PICKUP_LOCATIONS, {
      validators: (c) => (c.value as TripDestination[])?.length > 0 ? null : { pickupLocationsRequired: true },
    }),
    dogs: this.dogManager.dogsArray,
  });

  readonly destinationInputCtrl = new FormControl('');
  readonly pickupLocationInputCtrl = new FormControl('');

  readonly destinationsConfig: LocationListConfig = {
    titleKey: 'trips.form.destinations',
    hintKey: 'trips.form.destinationsHint',
    placeholderKey: 'trips.form.destinationPlaceholder',
    addButtonKey: 'trips.form.addDestination',
    emptyKey: 'trips.form.noDestinations',
    errorKey: 'trips.form.destinationsRequired',
  };

  readonly pickupLocationsConfig: LocationListConfig = {
    titleKey: 'trips.form.pickupLocations',
    hintKey: 'trips.form.pickupLocationsHint',
    placeholderKey: 'trips.form.pickupLocationPlaceholder',
    addButtonKey: 'trips.form.addPickupLocation',
    emptyKey: 'trips.form.noPickupLocations',
    errorKey: 'trips.form.pickupLocationsRequired',
  };

  get destinationsValue(): TripDestination[] {
    return (this.form.get('destinations')!.value as TripDestination[]) ?? [];
  }

  get pickupLocationsValue(): TripDestination[] {
    return (this.form.get('pickupLocations')!.value as TripDestination[]) ?? [];
  }

  addDestination(): void {
    const val = (this.destinationInputCtrl.value ?? '').trim();
    if (!val) return;
    const newDest: TripDestination = { id: crypto.randomUUID(), name: val };
    this.form.get('destinations')!.setValue([...this.destinationsValue, newDest]);
    this.destinationInputCtrl.setValue('');
  }

  removeDestination(index: number): void {
    const updated = [...this.destinationsValue];
    updated.splice(index, 1);
    this.form.get('destinations')!.setValue(updated);
    this.form.get('destinations')!.markAsTouched();
  }

  addPickupLocation(): void {
    const val = (this.pickupLocationInputCtrl.value ?? '').trim();
    if (!val) return;
    const newLoc: TripDestination = { id: crypto.randomUUID(), name: val };
    this.form.get('pickupLocations')!.setValue([...this.pickupLocationsValue, newLoc]);
    this.pickupLocationInputCtrl.setValue('');
  }

  removePickupLocation(index: number): void {
    const updated = [...this.pickupLocationsValue];
    updated.splice(index, 1);
    this.form.get('pickupLocations')!.setValue(updated);
    this.form.get('pickupLocations')!.markAsTouched();
  }

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

  private readonly capacityValue = toSignal(
    this.form.get('totalCapacity')!.valueChanges.pipe(
      startWith(this.form.get('totalCapacity')!.value as number | null),
    ),
  );

  readonly isAtCapacity = computed(() =>
    this.dogManager.dogsData().length >= (this.capacityValue() ?? 0),
  );

  readonly capacityWarning = computed((): string | null => {
    const capacity = this.capacityValue() ?? 0;
    const dogsCount = this.dogManager.dogsData().length;
    if (capacity < dogsCount) {
      return this.transloco.translate('trips.form.capacityWarning', { capacity, dogs: dogsCount });
    }
    return null;
  });

  selectedDog: Dog | null = null;
  dogDetailVisible = false;

  ngOnInit(): void {
    this.resolveRouteContext();
    this.store.dispatch(clearSelectedTrip());

    if (this.isEdit && this.editId) {
      this.loadTripForEdit();
    } else {
      this.initNewTrip();
    }
  }

  private resolveRouteContext(): void {
    this.editId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.editId;
  }

  private loadTripForEdit(): void {
    this.store.dispatch(loadTripById({ id: this.editId! }));
    this.store.select(selectSelectedTrip).pipe(
      filter(Boolean),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((trip) => {
      if (!this.formPatched) {
        this.form.patchValue({
          ...trip,
          destinations: trip.destinations?.length ? trip.destinations : DEFAULT_DESTINATIONS,
          pickupLocations: trip.pickupLocations?.length ? trip.pickupLocations : DEFAULT_PICKUP_LOCATIONS,
          date: trip.date ? new Date(trip.date + 'T00:00:00') : null,
        });
        this.formPatched = true;
      }
      this.dogManager.initFromTrip(trip);
    });
  }

  private initNewTrip(): void {
    this.dogManager.init(false, null);
    const prefilledDate = this.route.snapshot.queryParamMap.get('date');
    if (prefilledDate) {
      this.form.patchValue({ date: new Date(prefilledDate + 'T00:00:00') });
    }
  }

  openDogDetail(dog: Dog): void {
    this.selectedDog = dog;
    this.dogDetailVisible = true;
  }

  navigateToTrips(): void {
    this.router.navigate(['/admin/trips']);
  }

  onSubmit(): void {
    this.form.get('destinations')!.markAsTouched();
    this.form.get('pickupLocations')!.markAsTouched();
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = this.form.value as any;
    const rawDate = value.date as Date | null;
    const dateStr = rawDate ? toIsoDateStr(rawDate) : '';
    const totalCapacity: number = value.totalCapacity;
    const { isFull: _isFull, dogs: _dogs, ...rest } = value;
    const payload = { ...rest, date: dateStr, totalCapacity };

    if (this.isEdit && this.editId) {
      this.store.dispatch(updateTrip({ id: this.editId, trip: payload }));
    } else {
      const dogs = (this.dogManager.dogsArray.value as Dog[]).map(({ id: _id, ...rest }) => rest);
      this.store.dispatch(addTrip({ trip: payload, dogs: dogs.length ? dogs : undefined }));
    }
  }
}
