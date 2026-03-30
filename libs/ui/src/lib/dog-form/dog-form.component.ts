import { Component, Input, Output, EventEmitter } from '@angular/core';

import { ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'ui-dog-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    TooltipModule
],
  templateUrl: './dog-form.component.html',
  styleUrls: ['./dog-form.component.scss'],
})
export class DogFormComponent {
  @Input() formGroup!: FormGroup;
  @Input() index!: number;
  @Input() canRemove = false;
  @Output() removeClicked = new EventEmitter<void>();

  sizes = [
    { value: 'small', label: 'Small (< 10kg)' },
    { value: 'medium', label: 'Medium (10–25kg)' },
    { value: 'large', label: 'Large (> 25kg)' },
  ];

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
}
