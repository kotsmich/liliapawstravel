import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MessageModule } from 'primeng/message';
import { Store } from '@ngrx/store';
import { AuthActions, selectAuthIsLoading, selectAuthError } from '@admin/store/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, PasswordModule, ButtonModule, CardModule,
    IftaLabelModule, MessageModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(
    private fb: FormBuilder,
    private store: Store,
  ) {}

   form = this.fb.group({
    email: ['admin@liliapaws.com', [Validators.required, Validators.email]],
    password: ['admin123', [Validators.required, Validators.minLength(6)]],
  });

  loading$ = this.store.select(selectAuthIsLoading);
  error$ = this.store.select(selectAuthError);

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { email, password } = this.form.value;
    this.store.dispatch(AuthActions.login({ email: email!, password: password! }));
  }
}
