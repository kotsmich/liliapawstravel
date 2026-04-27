import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { ValidationErrorDirective } from '@ui/lib/directives/validation-error.directive';
import { AsyncButtonDirective } from '@ui/lib/directives/async-button.directive';
import { FocusInvalidInputDirective } from '@ui/lib/directives/focus-invalid-input.directive';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MessageModule } from 'primeng/message';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

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
    MessageModule,
    TranslocoModule,
    ValidationErrorDirective,
    AsyncButtonDirective,
    FocusInvalidInputDirective,
  ],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent {
  private readonly transloco = inject(TranslocoService);

  readonly form = input.required<FormGroup>();
  readonly loading = input<boolean>(false);
  readonly success = input<boolean>(false);
  readonly error = input<string | null>(null);

  readonly formSubmit = output<void>();
  readonly reset = output<void>();

  get emailHint(): string | null {
    const control = this.form()?.get('email');
    if (!control) return null;
    const value = control.value as string;
    return value && !control.hasError('email')
      ? this.transloco.translate('contact.form.replyTo', { email: value })
      : null;
  }

  errorFor(field: string): string | null {
    const control = this.form()?.get(field);
    if (!control?.errors || !control.touched) return null;
    if (control.errors['required']) return this.transloco.translate('contact.form.errors.required');
    if (control.errors['email']) return this.transloco.translate('contact.form.errors.email');
    if (control.errors['minlength']) return this.transloco.translate('contact.form.errors.minLength', { length: control.errors['minlength'].requiredLength });
    if (control.errors['pattern']) return this.transloco.translate('contact.form.errors.invalidPhone');
    return null;
  }
}
