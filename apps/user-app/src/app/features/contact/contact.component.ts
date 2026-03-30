import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { Store } from '@ngrx/store';
import { ContactActions, selectContactIsLoading, selectContactIsSuccess, selectContactError } from '@user/store/contact';
import { ContactFormComponent } from './components/contact-form/contact-form.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  ) {}

  form!: FormGroup;

  loading$ = this.store.select(selectContactIsLoading);
  success$ = this.store.select(selectContactIsSuccess);
  error$ = this.store.select(selectContactError);

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[\d\s\-().]{7,20}$/)]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(20)]],
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
}
