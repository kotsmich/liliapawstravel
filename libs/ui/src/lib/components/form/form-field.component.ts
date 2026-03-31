import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

export interface FormFieldOption {
  label: string;
  value: unknown;
}

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IftaLabelModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
  ],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  @Input() control!: AbstractControl;
  @Input() label!: string;
  @Input() fieldId!: string;
  @Input() type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'dropdown' | 'datepicker' = 'text';
  @Input() options?: FormFieldOption[];
  @Input() placeholder?: string;
  @Input() rows = 3;
  @Input() minDate?: Date;
  @Input() maxDate?: Date;

  get isInvalid(): boolean {
    return this.control?.invalid && (this.control.dirty || this.control.touched);
  }

  get errorMessage(): string {
    const errors = this.control?.errors;
    if (!errors) return '';
    if (errors['required']) return `${this.label} is required`;
    if (errors['email']) return 'Invalid email address';
    if (errors['minlength']) return `Minimum ${(errors['minlength'] as { requiredLength: number }).requiredLength} characters`;
    if (errors['pattern']) return `Invalid ${this.label.toLowerCase()} format`;
    return 'Invalid value';
  }

  get inputId(): string {
    return this.fieldId ?? this.label.toLowerCase().replace(/\s+/g, '-');
  }
}
