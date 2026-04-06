import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ContactForm } from '@models/lib/contact-form.model';
import { CardModule } from 'primeng/card';
import { Store } from '@ngrx/store';
import { TranslocoModule } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { submitContact, resetContact, selectContactIsLoading, selectContactIsSuccess, selectContactError } from '@user/features/contact/store';
import { ContactFormComponent } from './components/contact-form/contact-form.component';
import { ContactMapComponent } from './components/contact-map/contact-map.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CardModule, ContactFormComponent, ContactMapComponent, TranslocoModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  readonly contactForm = this.fb.group({
    name:    ['Kots', [Validators.required, Validators.minLength(2)]],
    email:   ['konstantinos.mich91@gmail.com', [Validators.required, Validators.email]],
    phone:   ['6948226016', [Validators.pattern(/^\+?[\d\s\-().]{7,20}$/)]],
    subject: ['Transportation pick up italy', [Validators.required, Validators.minLength(2)]],
    message: ['Lorem ipson is a way to be a winner and not a loser', [Validators.required, Validators.minLength(20)]],
  });

  readonly loading = toSignal(this.store.select(selectContactIsLoading), { initialValue: false });
  readonly success = toSignal(this.store.select(selectContactIsSuccess), { initialValue: false });
  readonly error   = toSignal(this.store.select(selectContactError),     { initialValue: null as string | null });

  onSubmit(): void {
    if (this.contactForm.invalid) { this.contactForm.markAllAsTouched(); return; }
    this.store.dispatch(submitContact({ form: this.contactForm.value as ContactForm }));
  }

  onReset(): void {
    this.contactForm.reset();
    this.store.dispatch(resetContact());
  }
}
