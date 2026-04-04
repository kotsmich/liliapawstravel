import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
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
import { TabsModule } from 'primeng/tabs';
import { Store } from '@ngrx/store';
import { filter, map, take } from 'rxjs';
import { clearSelectedTrip, loadTripById, updateTrip, addTrip, selectSelectedTrip, selectTripsMutating } from '@admin/features/trips/store';
import { Dog } from '@models/lib/dog.model';
import { DogFormDialogComponent } from '@admin/features/trips/components/dog-form-dialog/dog-form-dialog.component';
import { DogsTableComponent } from './components/dogs-table.component';
import { AccordionModule } from 'primeng/accordion';
import { DogManagerService } from './dog-manager.service';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DogManagerService],
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, SelectModule, ButtonModule, CardModule,
    IftaLabelModule, TextareaModule, DatePickerModule,
    MessageModule, ToastModule, TooltipModule, CheckboxModule, ConfirmDialogModule,
    TabsModule,
    DogFormDialogComponent,
    DogsTableComponent,
    AccordionModule,
    TranslocoModule,
  ],
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss'],
})
export class TripFormComponent implements OnInit {
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

  activeDogsTab = 'all';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef,
    private transloco: TranslocoService,
    readonly dogManager: DogManagerService,
  ) {}

  ngOnInit(): void {
    this.editId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.editId;

    this.buildForm();
    this.dogManager.init(this.isEdit, this.editId);
    this.store.dispatch(clearSelectedTrip());

    if (this.isEdit && this.editId) {
      this.loadTripForEdit();
    } else {
      this.prefillNewTrip();
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

  private prefillNewTrip(): void {
    const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    this.form.patchValue({
      departureCountry: pick(['Greece', 'Romania', 'Bulgaria']),
      departureCity:    pick(['Thessaloniki', 'Athens', 'Bucharest', 'Sofia']),
      arrivalCountry:   pick(['Austria', 'Netherlands', 'Germany']),
      arrivalCity:      pick(['Vienna', 'Amsterdam', 'Berlin', 'Munich']),
      totalCapacity:    pick([25, 35, 45, 55]),
    });

    const prefilledDate = this.route.snapshot.queryParamMap.get('date');
    if (prefilledDate) {
      this.form.patchValue({ date: new Date(prefilledDate + 'T00:00:00') });
    }
  }

  private loadTripForEdit(): void {
    this.store.dispatch(loadTripById({ id: this.editId! }));

    const trip$ = this.store.select(selectSelectedTrip).pipe(filter(Boolean));

    trip$.pipe(take(1)).subscribe((trip) => {
      this.form.patchValue({ ...trip, date: trip.date ? new Date(trip.date + 'T00:00:00') : null });
      this.cdr.markForCheck();
    });

    trip$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((trip) => {
      this.dogManager.setDogs(trip.dogs ?? [], trip.requester ?? []);
      this.cdr.markForCheck();
    });
  }

  /** Convenience getter so template expressions like `dogs.length` remain unchanged. */
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

  onTabChange(): void {
    this.dogManager.clearGroupSelections();
    this.cdr.markForCheck();
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
