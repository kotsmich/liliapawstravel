import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  computed,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ui-dog-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
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
  @Input() formGroup!: FormGroup;
  @Input() index!: number;
  @Input() canRemove = false;
  @Output() removeClicked = new EventEmitter<void>();
  @Output() photoFileChange = new EventEmitter<File | null>();
  @Output() documentFileChange = new EventEmitter<File | null>();

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('documentInput') documentInput!: ElementRef<HTMLInputElement>;

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

  readonly genders = computed((): { value: string; label: string }[] => {
    this._t();
    return [
      { value: 'male',   label: this.transloco.translate('dogs.genderMale') },
      { value: 'female', label: this.transloco.translate('dogs.genderFemale') },
    ];
  });

  ctrl(field: string): AbstractControl {
    return this.formGroup.get(field)!;
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
    this.photoInput.nativeElement.value = '';
  }

  onDocumentSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.documentName = file.name;
    this.documentFileChange.emit(file);
    this.documentInput.nativeElement.value = '';
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
