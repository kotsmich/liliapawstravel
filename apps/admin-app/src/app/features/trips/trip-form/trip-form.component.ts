import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, inject, computed } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Store } from '@ngrx/store';
import { filter, map, startWith } from 'rxjs';
import { clearSelectedTrip, loadTripById, updateTrip, addTrip, selectSelectedTrip, selectTripsMutating } from '@admin/features/trips/store';
import { toIsoDateStr } from '@admin/shared/utils/date';
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

  isEdit = false;
  editId: string | null = null;
  private formPatched = false;

  readonly today = new Date();

  readonly form = this.fb.group({
    date: [null as Date | null, Validators.required],
    departureCountry: ['', Validators.required],
    departureCity: ['', Validators.required],
    arrivalCountry: ['', Validators.required],
    arrivalCity: ['', Validators.required],
    status: ['upcoming', Validators.required],
    totalCapacity: [null as number | null, [Validators.required, Validators.min(1)]],
    notes: [''],
    isFull: [false],
    acceptingRequests: [true],
    dogs: this.dogManager.dogsArray,
  });

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
        this.form.patchValue({ ...trip, date: trip.date ? new Date(trip.date + 'T00:00:00') : null });
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
