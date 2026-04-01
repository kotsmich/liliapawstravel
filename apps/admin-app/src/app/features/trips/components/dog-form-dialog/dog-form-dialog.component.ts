import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take, takeUntil, Subject } from 'rxjs';
import { Dog } from '@models/lib/dog.model';
import { generateId } from '@models/lib/utils';
import {
  addDog, addDogSuccess, addDogFailure,
  updateDog, updateDogSuccess, updateDogFailure,
  selectTripsMutating,
} from '@admin/features/trips/store';

@Component({
  selector: 'app-dog-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    DialogModule, ButtonModule, InputTextModule, InputNumberModule,
    SelectModule, IftaLabelModule, TextareaModule, MessageModule,
  ],
  templateUrl: './dog-form-dialog.component.html',
  styleUrls: ['./dog-form-dialog.component.scss'],
})
export class DogFormDialogComponent implements OnChanges {
  /** The trip this dog belongs to. Pass null when creating a brand-new trip (dog is saved locally). */
  @Input() tripId: string | null = null;
  /** Dog to edit. Pass null to open in "add new dog" mode. */
  @Input() dog: Dog | null = null;
  @Input() visible = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  /** Emitted after the dog is persisted (or created locally when tripId is null). */
  @Output() dogSaved = new EventEmitter<Dog>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  errorMessage: string | null = null;
  mutating$ = this.store.select(selectTripsMutating);

  readonly sizes = [
    { value: 'small', label: 'Small (< 10 kg)' },
    { value: 'medium', label: 'Medium (10–25 kg)' },
    { value: 'large', label: 'Large (> 25 kg)' },
  ];

  get isNewDog(): boolean { return this.dog === null; }

  private readonly destroyRef = inject(DestroyRef);
  private cancelPending$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly actions$: Actions,
  ) {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.errorMessage = null;
      this.cancelPending$.next();
      this.buildForm();
    }
  }

  private buildForm(): void {
    const d = this.dog;
    this.form = this.fb.group({
      id: [d?.id ?? ''],
      name: [d?.name ?? 'saxlamaras', Validators.required],
      size: [d?.size ?? 'small', Validators.required],
      age: [d?.age ?? 3, [Validators.required, Validators.min(0)]],
      chipId: [d?.chipId ?? '222222222222222', [Validators.required, Validators.pattern(/^\d{15}$/)]],
      pickupLocation: [d?.pickupLocation ?? 'thessaloniki', Validators.required],
      dropLocation: [d?.dropLocation ?? 'austria', Validators.required],
      notes: [d?.notes ?? 'Sparkling'],
    });
  }

  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.errorMessage = null;

    const values = this.form.value as Dog;

    if (!this.tripId) {
      // New trip — no HTTP yet, just hand the data back to the parent
      const dog: Dog = { ...values, id: values.id || generateId() };
      this.dogSaved.emit(dog);
      this.visibleChange.emit(false);
      return;
    }

    if (this.isNewDog) {
      const { id: _id, ...dogPayload } = values;
      this.store.dispatch(addDog({ tripId: this.tripId, dog: dogPayload }));
    } else {
      this.store.dispatch(updateDog({ tripId: this.tripId, dog: values }));
    }

    this.actions$.pipe(
      ofType(addDogSuccess, addDogFailure, updateDogSuccess, updateDogFailure),
      take(1),
      takeUntil(this.cancelPending$),
    ).subscribe((action) => {
      if (action.type === addDogSuccess.type || action.type === updateDogSuccess.type) {
        this.dogSaved.emit((action as ReturnType<typeof addDogSuccess>).dog);
        this.visibleChange.emit(false);
      } else {
        this.errorMessage = (action as ReturnType<typeof addDogFailure>).error;
      }
    });
  }

  onCancel(): void {
    this.cancelPending$.next();
    this.cancelled.emit();
    this.visibleChange.emit(false);
  }
}
