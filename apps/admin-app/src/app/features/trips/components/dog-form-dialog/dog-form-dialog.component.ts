import { Component, ChangeDetectionStrategy, inject, input, output, OnInit, computed, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormArray, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, switchMap, startWith, map, of } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TranslocoModule } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';
import { TripDestination, TripRequester } from '@models/lib/trip.model';
import { DogFieldsComponent } from './dog-fields.component';
import { DogRequestorSelectorComponent } from './dog-requestor-selector/dog-requestor-selector.component';
import { AsyncButtonDirective } from '@ui/lib/directives/async-button.directive';
import { buildAddDogGroup, buildEditDogGroup } from '@admin/features/trips/trip-form/dog-form.factory';
import { toDogPayload } from '@admin/features/trips/shared/dog-payload';


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
  readonly panelForms = computed(() => {
    this._panelCount();
    return (this.addForms?.controls ?? []) as FormGroup[];
  });

  activeAccordionPanels: string[] = [];

  private readonly fb = inject(FormBuilder);

  private buildForms(): void {
    if (this.isNewDog()) {
      this.addForms = this.fb.array([buildAddDogGroup(1)]);
      this._panelCount.set(1);
      this.activeAccordionPanels = [];
      this.activeForm$.next(this.addForms);
    } else {
      this.editForm = buildEditDogGroup(this.dog()!);
      if (this.editForm.invalid) this.editForm.markAllAsTouched();
      this.activeForm$.next(this.editForm);
    }
  }

  panelLabel(i: number): string {
    const name = (this.addForms.at(i).get('name')?.value as string)?.trim();
    return name ? `Dog ${i + 1}: ${name}` : `Dog ${i + 1}`;
  }

  addPanel(): void {
    this.addForms.push(buildAddDogGroup(this.addForms.length + 1));
    this._panelCount.update(v => v + 1);
    this.activeAccordionPanels = [];
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
      this.dogSaved.emit(this.addForms.value.map((v: any) => toDogPayload(v, this.tripDestinations(), this.tripPickupLocations())));
    } else {
      this.editForm.markAllAsTouched();
      if (this.editForm.invalid) return;
      this.dogSaved.emit([{ id: this.dog()!.id, ...toDogPayload(this.editForm.value, this.tripDestinations(), this.tripPickupLocations()) } as Dog]);
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
