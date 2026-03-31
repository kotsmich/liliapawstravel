import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    IftaLabelModule,
    MessageModule
  ],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent {
  @Input() form!: FormGroup;
  @Input() loading: boolean = false;
  @Input() success: boolean = false;
  @Input() error: string | null = null;

  @Output() formSubmit = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  get emailHint(): string | null {
    const ctrl = this.form?.get('email');
    if (!ctrl) return null;
    const val = ctrl.value as string;
    return val && !ctrl.hasError('email') ? `We'll reply to ${val}` : null;
  }

  err(field: string): string | null {
    const c = this.form?.get(field);
    if (!c?.errors || !c.touched) return null;
    if (c.errors['required']) return 'Required.';
    if (c.errors['email']) return 'Valid email required.';
    if (c.errors['minlength']) return `Min ${c.errors['minlength'].requiredLength} chars.`;
    if (c.errors['pattern']) return 'Invalid phone number.';
    return null;
  }
}
