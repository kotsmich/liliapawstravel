import { Component, ChangeDetectionStrategy, inject, input, output, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, switchMap, startWith, map } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TranslocoModule } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';
import { TripRequester } from '@models/lib/trip.model';
import { DogFieldsComponent } from './dog-fields.component';


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
export class DogFormDialogComponent {
  readonly tripId = input<string | null>(null);
  /** Dog to edit. Null opens in add mode (accordion, multiple dogs). */
  readonly dog = input<Dog | null>(null);
  private _visible = false;
  get visible(): boolean { return this._visible; }
  @Input() set visible(value: boolean) {
    this._visible = value;
    if (value) this.buildForms();
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
      name:           [d?.name           ?? '',   Validators.required],
      size:           [d?.size           ?? '',   Validators.required],
      gender:         [d?.gender         ?? '',   Validators.required],
      age:            [d?.age            ?? null, [Validators.required, Validators.min(0)]],
      chipId:         [d?.chipId         ?? '',   [Validators.required, Validators.pattern(/^\d{15}$/)]],
      pickupLocation: [d?.pickupLocation ?? '',   Validators.required],
      dropLocation:   [d?.dropLocation   ?? '',   Validators.required],
      notes:          [d?.notes          ?? ''],
      requesterName:    [d?.requesterName  ?? ''],
      requestId:        [d?.requestId      ?? null],
      requesterKey:     [DogFormDialogComponent.requesterKey(d)],
      newRequesterName: [null],
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
      this.dogSaved.emit(this.addForms.value.map((v: any) => this.stripInternalFields(v)));
    } else {
      this.editForm.markAllAsTouched();
      if (this.editForm.invalid) return;
      this.dogSaved.emit([{ id: this.dog()!.id, ...this.stripInternalFields(this.editForm.value) } as Dog]);
    }
    this.visibleChange.emit(false);
  }

  private resolveRequesterName(raw: { newRequesterName: string | null; requesterName: string | null }): string | null {
    return raw.newRequesterName?.trim() || raw.requesterName;
  }

  private stripInternalFields({ newRequesterName, requesterKey: _rk, ...rest }: any): Omit<Dog, 'id'> {
    return { ...rest, requesterName: this.resolveRequesterName({ newRequesterName, requesterName: rest.requesterName }) };
  }

  onCancel(): void {
    this.cancelled.emit();
    this.visibleChange.emit(false);
  }
}
