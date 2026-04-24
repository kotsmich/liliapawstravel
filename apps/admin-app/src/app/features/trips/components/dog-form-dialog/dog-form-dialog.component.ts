import { Component, ChangeDetectionStrategy, inject, input, output, OnInit, computed, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Subject, switchMap, startWith, map, of } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TranslocoModule } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';
import { TripDestination, TripRequester } from '@models/lib/trip.model';
import { DogFieldsComponent } from './dog-fields.component';
import { DogRequestorSelectorComponent } from './dog-requestor-selector/dog-requestor-selector.component';
import { RandomProperty, RandomUtil } from '@models/index';
import { AsyncButtonDirective } from '@ui/lib/directives/async-button.directive';


@Component({
  selector: 'app-dog-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule, ButtonModule, AccordionModule,
    DogFieldsComponent, DogRequestorSelectorComponent, TranslocoModule, AsyncButtonDirective,
  ],
  templateUrl: './dog-form-dialog.component.html',
  styleUrls: ['./dog-form-dialog.component.scss'],
})
export class DogFormDialogComponent implements OnInit {
  readonly tripId = input<string | null>(null);
  readonly tripDestinations = input<TripDestination[]>([]);
  readonly tripPickupLocations = input<TripDestination[]>([]);
  /** Dog to edit. Null opens in add mode (accordion, multiple dogs). */
  readonly dog = input<Dog | null>(null);

  ngOnInit(): void {
    this.buildForms();
  }

  /** Set by parent while dispatching so the save button shows a spinner. */
  readonly saving = input(false);
  /** Requestors from trip.requesters — used to populate the requestor dropdown. */
  readonly requestors = input<TripRequester[]>([]);
  /** Requester form owned by DogManagerService — shown at the top of add mode so the admin picks one requester for the whole batch. */
  readonly addModeRequesterForm = input<FormGroup | null>(null);

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
  private readonly _mainFormInvalid = toSignal(
    this.activeForm$.pipe(
      switchMap(form => form.statusChanges.pipe(startWith(form.status))),
      map(status => status === 'INVALID'),
    ),
    { initialValue: false },
  );
  private readonly _addModeFormInvalid = toSignal(
    toObservable(this.addModeRequesterForm).pipe(
      switchMap(form => form
        ? form.statusChanges.pipe(startWith(form.status))
        : of('VALID')),
      map(status => status === 'INVALID'),
    ),
    { initialValue: false },
  );
  readonly formInvalid = computed(() => this._mainFormInvalid() || (this.isNewDog() && this._addModeFormInvalid()));

  readonly isNewDog = computed(() => this.dog() === null);
  private readonly _panelCount = signal(0);
  readonly panelForms = computed(() => { this._panelCount(); return (this.addForms?.controls ?? []) as FormGroup[]; });

  activeAccordionPanels: string[] = ['0'];

  private readonly fb = inject(FormBuilder);

  private buildForms(): void {
    if (this.isNewDog()) {
      this.addForms = this.fb.array([this.buildAddDogGroup(1)]);
      this._panelCount.set(1);
      this.activeAccordionPanels = ['0'];
      this.activeForm$.next(this.addForms);
    } else {
      this.editForm = this.buildEditDogGroup(this.dog()!);
      if (this.editForm.invalid) this.editForm.markAllAsTouched();
      this.activeForm$.next(this.editForm);
    }
  }

  private static requesterValidator(group: AbstractControl): ValidationErrors | null {
    const hasExisting = !!group.get('requesterId')?.value;
    const hasNew = !!group.get('newRequesterName')?.value?.trim();
    return hasExisting || hasNew ? null : { requesterRequired: true };
  }

  static requesterKey(d?: Dog | null): string | null {
    return d?.requesterId ?? null;
  }

  /** Form group for add mode — no requester fields (requester is set at the group level). */
  private buildAddDogGroup(index: number): FormGroup {
    return this.fb.group({
      name:             [`Dog ${index}`,  Validators.required],
      size:             [null],
      height:           [null],
      behaviors:        [[] as string[]],
      gender:           [null],
      age:              [null,   Validators.min(0)],
      chipId:           [null],
      pickupLocation:   [''],
      pickupLocationId: [null],
      dropLocation:     [''],
      notes:            [''],
      destinationId:    [null],
      receiver:         [null],
      receiverPhone:    [null],
    });
  }

  /** Form group for edit mode — includes requester fields and the requester validator. */
  private buildEditDogGroup(d: Dog): FormGroup {
    return this.fb.group({
      name:             [d.name,              Validators.required],
      size:             [d.size],
      height:           [d.height            ?? null],
      behaviors:        [d.behaviors         ?? []],
      gender:           [d.gender],
      age:              [d.age,               Validators.min(0)],
      chipId:           [d.chipId],
      pickupLocation:   [d.pickupLocation    ?? ''],
      pickupLocationId: [d.pickupLocationId  ?? null],
      dropLocation:     [d.dropLocation      ?? ''],
      notes:            [d.notes             ?? ''],
      requesterId:      [d.requesterId       ?? null],
      requesterKey:     [DogFormDialogComponent.requesterKey(d)],
      newRequesterName: [null],
      destinationId:    [d.destinationId     ?? null],
      receiver:         [d.receiver          ?? null],
      receiverPhone:    [d.receiverPhone     ?? null],
    }, { validators: DogFormDialogComponent.requesterValidator });
  }

  panelLabel(i: number): string {
    const name = (this.addForms.at(i).get('name')?.value as string)?.trim();
    return name ? `Dog ${i + 1}: ${name}` : `Dog ${i + 1}`;
  }

  addPanel(): void {
    this.addForms.push(this.buildAddDogGroup(this.addForms.length + 1));
    this._panelCount.update(v => v + 1);
    this.activeAccordionPanels = [(this.addForms.length - 1).toString()];
  }

  removePanel(i: number): void {
    this.addForms.removeAt(i);
    this._panelCount.update(v => v - 1);
  }

  onSave(): void {
    if (this.isNewDog()) {
      this.addForms.markAllAsTouched();
      this.addModeRequesterForm()?.markAllAsTouched();
      if (this.addForms.invalid || this.addModeRequesterForm()?.invalid) return;
      this.dogSaved.emit(this.addForms.value.map((v: any) => this.toDogPayload(v)));
    } else {
      this.editForm.markAllAsTouched();
      if (this.editForm.invalid) return;
      this.dogSaved.emit([{ id: this.dog()!.id, ...this.toDogPayload(this.editForm.value) } as Dog]);
    }
  }

  private toDogPayload({ newRequesterName, requesterKey: _rk, ...dogData }: any): Omit<Dog, 'id'> {
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

    return {
      ...dogData,
      pickupLocation,
      pickupLocationId,
      dropLocation,
...(newRequesterName?.trim() ? { newRequesterName: newRequesterName.trim() } : {}),
    };
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
