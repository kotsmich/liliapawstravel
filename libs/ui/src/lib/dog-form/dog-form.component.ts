import {
  Component,
  inject,
  computed,
  input,
  output,
  viewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { TripDestination } from '@models/lib/trip.model';

@Component({
  selector: 'ui-dog-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    TooltipModule,
    MessageModule,
    TranslocoModule,
  ],
  templateUrl: './dog-form.component.html',
  styleUrls: ['./dog-form.component.scss'],
})
export class DogFormComponent {
  readonly formGroup = input.required<FormGroup>();
  readonly index = input.required<number>();
  readonly canRemove = input(false);
  readonly tripDestinations = input<TripDestination[]>([]);

  readonly removeClicked = output<void>();
  readonly photoFileChange = output<File | null>();
  readonly documentFileChange = output<File | null>();

  readonly photoInput = viewChild.required<ElementRef<HTMLInputElement>>('photoInput');
  readonly documentInput = viewChild.required<ElementRef<HTMLInputElement>>('documentInput');

  photoPreview: string | null = null;
  documentName: string | null = null;

  private readonly transloco = inject(TranslocoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly _t = toSignal(this.transloco.selectTranslation(), { initialValue: null });

  readonly sizes = computed((): { value: string; label: string }[] => {
    this._t();
    return [
      { value: 'small',  label: this.transloco.translate('dogs.sizeSmall') },
      { value: 'medium', label: this.transloco.translate('dogs.sizeMedium') },
      { value: 'large',  label: this.transloco.translate('dogs.sizeLarge') },
    ];
  });

  readonly heights = computed((): { value: string; label: string }[] => {
    this._t();
    return [
      { value: 'under10', label: this.transloco.translate('dogs.heightUnder10') },
      { value: '10to25',  label: this.transloco.translate('dogs.height10to25') },
      { value: 'over30',  label: this.transloco.translate('dogs.heightOver30') },
    ];
  });

  readonly behaviors = computed((): { value: string; label: string }[] => {
    this._t();
    return [
      { value: 'friendly',   label: this.transloco.translate('dogs.behaviorFriendly') },
      { value: 'aggressive', label: this.transloco.translate('dogs.behaviorAggressive') },
      { value: 'fearful',    label: this.transloco.translate('dogs.behaviorFearful') },
      { value: 'anxious',    label: this.transloco.translate('dogs.behaviorAnxious') },
      { value: 'calm',       label: this.transloco.translate('dogs.behaviorCalm') },
    ];
  });

  readonly genders = computed((): { value: string; label: string }[] => {
    this._t();
    return [
      { value: 'male',   label: this.transloco.translate('dogs.genderMale') },
      { value: 'female', label: this.transloco.translate('dogs.genderFemale') },
    ];
  });

  hasBehavior(value: string): boolean {
    const current = this.ctrl('behaviors').value as string[] | null;
    return Array.isArray(current) && current.includes(value);
  }

  toggleBehavior(value: string): void {
    const ctrl = this.ctrl('behaviors');
    const current = Array.isArray(ctrl.value) ? [...(ctrl.value as string[])] : [];
    const idx = current.indexOf(value);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(value);
    ctrl.setValue(current);
    ctrl.markAsTouched();
    ctrl.markAsDirty();
  }

  readonly pickupOptions = computed((): { value: string; label: string }[] => {
    this._t();
    return [
      ...this.tripDestinations().map(d => ({ value: d.name, label: d.name })),
      { value: 'Other', label: this.transloco.translate('dogs.pickupOther') },
    ];
  });

  ctrl(field: string): AbstractControl {
    return this.formGroup().get(field)!;
  }

  errorFor(field: string): string {
    const c = this.ctrl(field);
    if (!c.errors || !c.touched) return '';
    if (c.errors['required']) return 'Required.';
    if (c.errors['min']) return 'Must be 0 or greater.';
    if (c.errors['minlength']) return `Min ${c.errors['minlength'].requiredLength} chars.`;
    if (c.errors['pattern']) return field === 'chipId' ? '15-digit chip ID.' : 'Invalid format.';
    return '';
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview = e.target?.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
    this.photoFileChange.emit(file);
    this.photoInput().nativeElement.value = '';
  }

  onDocumentSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.documentName = file.name;
    this.documentFileChange.emit(file);
    this.documentInput().nativeElement.value = '';
  }

  onPhotoDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview = e.target?.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
    this.photoFileChange.emit(file);
  }

  onDocumentDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.documentName = file.name;
    this.documentFileChange.emit(file);
  }

  removePhoto(): void {
    this.photoPreview = null;
    this.photoFileChange.emit(null);
  }

  removeDocument(): void {
    this.documentName = null;
    this.documentFileChange.emit(null);
  }

  reset(): void {
    this.photoPreview = null;
    this.documentName = null;
  }
}
