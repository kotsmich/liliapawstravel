import { Component, ChangeDetectionStrategy, inject, input, output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, switchMap, startWith, map } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TranslocoModule } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';
import { TripDestination, TripRequester } from '@models/lib/trip.model';
import { DogFieldsComponent } from './dog-fields.component';
import { RandomProperty, RandomUtil } from '@models/index';


@Component({
  selector: 'app-dog-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogModule, ButtonModule, AccordionModule,
    DogFieldsComponent, TranslocoModule,
  ],
  templateUrl: './dog-form-dialog.component.html',
  styleUrls: ['./dog-form-dialog.component.scss'],
})
export class DogFormDialogComponent implements OnChanges {
  readonly tripId = input<string | null>(null);
  readonly tripDestinations = input<TripDestination[]>([]);
  readonly tripPickupLocations = input<TripDestination[]>([]);
  /** Dog to edit. Null opens in add mode (accordion, multiple dogs). */
  readonly dog = input<Dog | null>(null);
  @Input() visible = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.buildForms();
    }
  }
  /** Set by parent while dispatching so the save button shows a spinner. */
  readonly saving = input(false);
  /** Requestors from trip.requesters — used to populate the requestor dropdown. */
  readonly requestors = input<TripRequester[]>([]);

  readonly visibleChange = output<boolean>();
  /** Edit mode emits a single-element array; add mode emits all dogs. */
  readonly dogSaved = output<Dog[]>();
  readonly cancelled = output<void>();
  readonly photoFileChange = output<File | null>();
  readonly documentFileChange = output<File | null>();

  /** Single form used in edit mode. */
  editForm!: FormGroup;
  /** FormArray of dog panels used in add mode. */
  addForms!: FormArray;

  private readonly activeForm$ = new Subject<AbstractControl>();
  readonly formInvalid = toSignal(
    this.activeForm$.pipe(
      switchMap(form => form.statusChanges.pipe(startWith(form.status))),
      map(status => status === 'INVALID'),
    ),
    { initialValue: false },
  );

  get isNewDog(): boolean { return this.dog() === null; }
  get panelForms(): FormGroup[] { return (this.addForms?.controls ?? []) as FormGroup[]; }

  activeAccordionPanels: string[] = ['0'];

  private readonly fb = inject(FormBuilder);

  private buildForms(): void {
    if (this.isNewDog) {
      this.addForms = this.fb.array([this.buildDogGroup()]);
      this.activeAccordionPanels = ['0'];
      this.activeForm$.next(this.addForms);
    } else {
      this.editForm = this.buildDogGroup(this.dog()!);
      this.activeForm$.next(this.editForm);
    }
  }

  private static requesterValidator(group: AbstractControl): ValidationErrors | null {
    const hasExisting = !!group.get('requestId')?.value || !!group.get('requesterName')?.value?.trim();
    const hasNew = !!group.get('newRequesterName')?.value?.trim();
    return hasExisting || hasNew ? null : { requesterRequired: true };
  }

  static requesterKey(d?: Dog | null): string | null {
    if (d?.requestId) return d.requestId;
    if (d?.requesterName) return `__m__${d.requesterName}`;
    return null;
  }

  private buildDogGroup(d?: Dog | null): FormGroup {
    return this.fb.group({
      name:              [d?.name              ?? RandomUtil.pick(RandomProperty.dogNames),   Validators.required],
      size:              [d?.size              ?? RandomUtil.pick(RandomProperty.sizes),   Validators.required],
      gender:            [d?.gender            ?? RandomUtil.pick(RandomProperty.genders),   Validators.required],
      age:               [d?.age               ?? RandomUtil.pick(RandomProperty.ages), [Validators.required, Validators.min(0)]],
      chipId:            [d?.chipId            ?? RandomUtil.pick(RandomProperty.chipIds),   [Validators.required, Validators.pattern(/^\d{15}$/)]],
      pickupLocation:    [d?.pickupLocation    ?? ''],
      pickupLocationId:  [d?.pickupLocationId  ?? null, Validators.required],
      dropLocation:      [d?.dropLocation      ?? ''],
      notes:             [d?.notes             ?? ''],
      requesterName:     [d?.requesterName     ?? ''],
      requestId:         [d?.requestId         ?? null],
      requesterKey:      [DogFormDialogComponent.requesterKey(d)],
      newRequesterName:  [RandomUtil.pick(RandomProperty.requesterNames)],
      destinationId:     [d?.destinationId     ?? null, Validators.required],
      receiver:          [d?.receiver          ?? null],
    }, { validators: DogFormDialogComponent.requesterValidator });
  }

  panelLabel(i: number): string {
    const name = (this.addForms.at(i).get('name')?.value as string)?.trim();
    return name ? `Dog ${i + 1}: ${name}` : `Dog ${i + 1}`;
  }

  addPanel(): void {
    this.addForms.push(this.buildDogGroup());
    this.activeAccordionPanels = [(this.addForms.length - 1).toString()];
  }

  removePanel(i: number): void {
    this.addForms.removeAt(i);
  }

  onSave(): void {
    if (this.isNewDog) {
      this.addForms.markAllAsTouched();
      if (this.addForms.invalid) return;
      this.dogSaved.emit(this.addForms.value.map((v: any) => this.toDogPayload(v)));
    } else {
      this.editForm.markAllAsTouched();
      if (this.editForm.invalid) return;
      this.dogSaved.emit([{ id: this.dog()!.id, ...this.toDogPayload(this.editForm.value) } as Dog]);
    }
    this.visibleChange.emit(false);
  }

  private toDogPayload({ newRequesterName, requesterKey: _rk, ...dogData }: any): Omit<Dog, 'id'> {
    const requesterName = newRequesterName?.trim() || dogData.requesterName;

    const destinations = this.tripDestinations();
    const pickupLocations = this.tripPickupLocations();
    const findDest = (id: string | null) => destinations.find((d: TripDestination) => d.id === id) ?? null;
    const findPickup = (id: string | null) => pickupLocations.find((d: TripDestination) => d.id === id) ?? null;

    // Resolve pickupLocation text from the selected pickup location ID (or 'Other' when none chosen).
    const pickupDest = findPickup(dogData.pickupLocationId);
    const pickupLocation = pickupLocations.length > 0 ? (pickupDest?.name ?? 'Other') : (dogData.pickupLocation || '');
    const pickupLocationId = pickupDest ? dogData.pickupLocationId : null;

    // Keep dropLocation in sync with the selected delivery stop when one is chosen.
    const dropDest = findDest(dogData.destinationId);
    const dropLocation = dropDest ? dropDest.name : dogData.dropLocation;

    return { ...dogData, pickupLocation, pickupLocationId, dropLocation, requesterName };
  }

  onCancel(): void {
    this.cancelled.emit();
    this.visibleChange.emit(false);
  }
}
