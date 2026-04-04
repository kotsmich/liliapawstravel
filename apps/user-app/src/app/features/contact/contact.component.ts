import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { Store } from '@ngrx/store';
import { TranslocoModule } from '@jsverse/transloco';
import { submitContact, resetContact, selectContactIsLoading, selectContactIsSuccess, selectContactError } from '@user/features/contact/store';
import { ContactFormComponent } from './components/contact-form/contact-form.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe, ReactiveFormsModule,
    CardModule, ContactFormComponent, TranslocoModule,
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  contactForm!: FormGroup;

  loading$ = this.store.select(selectContactIsLoading);
  success$ = this.store.select(selectContactIsSuccess);
  error$ = this.store.select(selectContactError);

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['Kots', [Validators.required, Validators.minLength(2)]],
      email: ['konstantinos.mich91@gmail.com', [Validators.required, Validators.email]],
      phone: ['6948226016', [Validators.pattern(/^\+?[\d\s\-().]{7,20}$/)]],
      subject: ['Transportation pick up italy', [Validators.required, Validators.minLength(2)]],
      message: ['Lorem ipson is a way to be a winner and not a loser', [Validators.required, Validators.minLength(20)]],
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) { this.contactForm.markAllAsTouched(); return; }
    this.store.dispatch(submitContact({ form: this.contactForm.value }));
  }

  onReset(): void {
    this.contactForm.reset();
    this.store.dispatch(resetContact());
  }
}
