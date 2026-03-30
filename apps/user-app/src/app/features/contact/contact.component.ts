import { Component, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ContactActions,
  selectContactIsLoading,
  selectContactIsSuccess,
  selectContactHasError,
} from '@myorg/store';
import { ContactFormComponent } from './components/contact-form/contact-form.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    CardModule, ContactFormComponent,
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private store: Store,
    private destroyRef: DestroyRef,
  ) {}

  form!: FormGroup;
  emailHint = '';

  loading$ = this.store.select(selectContactIsLoading);
  success$ = this.store.select(selectContactIsSuccess);
  error$ = this.store.select(selectContactHasError);

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[\d\s\-().]{7,20}$/)]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(20)]],
    });

    this.form.get('email')!.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((v) => {
      const val = v as string;
      this.emailHint = val && !this.form.get('email')!.hasError('email') ? `We'll reply to ${val}` : '';
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.store.dispatch(ContactActions.submitContact({ form: this.form.value }));
  }

  onReset(): void {
    this.form.reset();
    this.store.dispatch(ContactActions.resetContact());
  }

  err(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors || !c.touched) return '';
    if (c.errors['required']) return 'Required.';
    if (c.errors['email']) return 'Valid email required.';
    if (c.errors['minlength']) return `Min ${c.errors['minlength'].requiredLength} chars.`;
    if (c.errors['pattern']) return 'Invalid phone number.';
    return '';
  }
}
