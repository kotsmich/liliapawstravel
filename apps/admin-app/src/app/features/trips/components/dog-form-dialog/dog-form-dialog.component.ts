import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { Dog } from '@models/lib/dog.model';
import { TripRequester } from '@models/lib/trip.model';
import { RandomUtil, RandomProperty } from '@models/lib/utils';
import { DogFieldsComponent } from './dog-fields.component';


@Component({
  selector: 'app-dog-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogModule, ButtonModule, AccordionModule,
    DogFieldsComponent,
  ],
  templateUrl: './dog-form-dialog.component.html',
  styleUrls: ['./dog-form-dialog.component.scss'],
})
export class DogFormDialogComponent implements OnChanges {
  @Input() tripId: string | null = null;
  /** Dog to edit. Null opens in add mode (accordion, multiple dogs). */
  @Input() dog: Dog | null = null;
  @Input() visible = false;
  /** Set by parent while dispatching so the save button shows a spinner. */
  @Input() saving = false;
  /** Requestors from trip.requesters — used to populate the requestor dropdown. */
  @Input() requestors: TripRequester[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  /** Edit mode emits a single-element array; add mode emits all dogs. */
  @Output() dogSaved = new EventEmitter<Dog[]>();
  @Output() cancelled = new EventEmitter<void>();

  /** Single form used in edit mode. */
  editForm!: FormGroup;
  /** FormArray of dog panels used in add mode. */
  addForms!: FormArray;

  get isNewDog(): boolean { return this.dog === null; }
  get panelForms(): FormGroup[] { return (this.addForms?.controls ?? []) as FormGroup[]; }

  activeAccordionPanels: string[] = ['0'];

  private readonly fb = inject(FormBuilder);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.buildForms();
    }
  }

  private buildForms(): void {
    if (this.isNewDog) {
      this.addForms = this.fb.array([this.buildDogGroup()]);
      this.activeAccordionPanels = ['0'];
    } else {
      this.editForm = this.buildDogGroup(this.dog!);
    }
  }

  private buildDogGroup(d?: Dog | null): FormGroup {
    return this.fb.group({
      name:           [d?.name           ?? RandomUtil.pick(RandomProperty.dogNames),        Validators.required],
      size:           [d?.size           ?? RandomUtil.pick(RandomProperty.sizes),           Validators.required],
      age:            [d?.age            ?? RandomUtil.pick(RandomProperty.ages),            [Validators.required, Validators.min(0)]],
      chipId:         [d?.chipId         ?? RandomUtil.pick(RandomProperty.chipIds),         [Validators.required, Validators.pattern(/^\d{15}$/)]],
      pickupLocation: [d?.pickupLocation ?? RandomUtil.pick(RandomProperty.pickupLocations), Validators.required],
      dropLocation:   [d?.dropLocation   ?? RandomUtil.pick(RandomProperty.dropLocations),   Validators.required],
      notes:          [d?.notes          ?? RandomUtil.pick(RandomProperty.notes)],
      requesterName:    [d?.requesterName  ?? RandomUtil.pick(RandomProperty.requesterNames)],
      requestId:        [d?.requestId      ?? null],
      newRequesterName: [null],
    });
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

      this.dogSaved.emit(this.addForms.value as Dog[]);
      this.visibleChange.emit(false);
    } else {
      this.editForm.markAllAsTouched();
      if (this.editForm.invalid) return;

      const { newRequesterName: _nr, ...editValues } = this.editForm.value;
      this.dogSaved.emit([{ id: this.dog!.id, ...editValues } as Dog]);
      this.visibleChange.emit(false);
    }
  }

  onCancel(): void {
    this.cancelled.emit();
    this.visibleChange.emit(false);
  }
}
