import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { TranslocoModule } from '@jsverse/transloco';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MessageModule } from 'primeng/message';
import { toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import {
  selectCurrentUser,
  selectEmailMutating, selectEmailError,
  selectPasswordMutating, selectPasswordError,
  changeEmail, changeEmailSuccess,
  changePassword, changePasswordSuccess,
} from '@admin/core/store/auth';
import { ValidationErrorDirective } from '@ui/lib/directives/validation-error.directive';
import { AsyncButtonDirective } from '@ui/lib/directives/async-button.directive';
import { passwordsMatchValidator } from '@admin/shared/validators/passwords-match.validator';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe, ReactiveFormsModule, TranslocoModule,
    InputTextModule, PasswordModule, ButtonModule,
    IftaLabelModule, MessageModule,
    ValidationErrorDirective, AsyncButtonDirective,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);

  user$ = this.store.select(selectCurrentUser);
  emailSaving = toSignal(this.store.select(selectEmailMutating), { initialValue: false });
  emailError = toSignal(this.store.select(selectEmailError), { initialValue: null });
  passwordSaving = toSignal(this.store.select(selectPasswordMutating), { initialValue: false });
  passwordError = toSignal(this.store.select(selectPasswordError), { initialValue: null });

  emailForm = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newEmail: ['', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatchValidator });

  submitEmailChange(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newEmail } = this.emailForm.value;
    this.store.dispatch(changeEmail({ currentPassword: currentPassword!, newEmail: newEmail! }));
    this.actions$.pipe(ofType(changeEmailSuccess), take(1)).subscribe(() => this.emailForm.reset());
  }

  submitPasswordChange(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.store.dispatch(changePassword({ currentPassword: currentPassword!, newPassword: newPassword! }));
    this.actions$.pipe(ofType(changePasswordSuccess), take(1)).subscribe(() => this.passwordForm.reset());
  }
}
