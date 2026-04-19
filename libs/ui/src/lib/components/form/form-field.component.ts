import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
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
  readonly control = input.required<AbstractControl>();
  readonly label = input.required<string>();
  readonly fieldId = input.required<string>();
  readonly type = input<'text' | 'email' | 'tel' | 'number' | 'textarea' | 'dropdown' | 'datepicker'>('text');
  readonly options = input<FormFieldOption[]>();
  readonly placeholder = input<string>();
  readonly rows = input(3);
  readonly minDate = input<Date>();
  readonly maxDate = input<Date>();

  readonly isInvalid = computed(() => {
    const c = this.control();
    return c?.invalid && (c.dirty || c.touched);
  });

  readonly errorMessage = computed(() => {
    const errors = this.control()?.errors;
    if (!errors) return '';
    if (errors['required']) return `${this.label()} is required`;
    if (errors['email']) return 'Invalid email address';
    if (errors['minlength']) return `Minimum ${(errors['minlength'] as { requiredLength: number }).requiredLength} characters`;
    if (errors['pattern']) return `Invalid ${this.label().toLowerCase()} format`;
    return 'Invalid value';
  });

  readonly inputId = computed(() =>
    this.fieldId() ?? this.label().toLowerCase().replace(/\s+/g, '-')
  );
}
