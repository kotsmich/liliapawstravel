import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
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
    const ctrl = this.form()?.get('email');
    if (!ctrl) return null;
    const val = ctrl.value as string;
    return val && !ctrl.hasError('email')
      ? this.transloco.translate('contact.form.replyTo', { email: val })
      : null;
  }

  err(field: string): string | null {
    const c = this.form()?.get(field);
    if (!c?.errors || !c.touched) return null;
    if (c.errors['required']) return this.transloco.translate('contact.form.errors.required');
    if (c.errors['email']) return this.transloco.translate('contact.form.errors.email');
    if (c.errors['minlength']) return this.transloco.translate('contact.form.errors.minLength', { length: c.errors['minlength'].requiredLength });
    if (c.errors['pattern']) return this.transloco.translate('contact.form.errors.invalidPhone');
    return null;
  }
}
