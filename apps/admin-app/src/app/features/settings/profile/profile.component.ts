import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslocoModule } from '@jsverse/transloco';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { catchError, EMPTY } from 'rxjs';
import { AuthService } from '@admin/services/auth.service';
import { selectCurrentUser, restoreSession } from '@admin/core/store/auth';
import { AdminUser } from '@models/lib/admin-user.model';

function passwordsMatch(group: AbstractControl) {
  const newPwd = group.get('newPassword')?.value as string;
  const confirm = group.get('confirmPassword')?.value as string;
  if (!confirm) return null;
  return newPwd === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe, ReactiveFormsModule, TranslocoModule,
    InputTextModule, PasswordModule, ButtonModule,
    IftaLabelModule, MessageModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly store = inject(Store);
  private readonly messageService = inject(MessageService);

  user$ = this.store.select(selectCurrentUser);

  emailSaving = signal(false);
  passwordSaving = signal(false);
  emailError = signal<string | null>(null);
  passwordError = signal<string | null>(null);

  emailForm = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newEmail: ['', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  submitEmailChange(currentUser: AdminUser): void {
    if (this.emailForm.invalid) { this.emailForm.markAllAsTouched(); return; }
    const { currentPassword, newEmail } = this.emailForm.value;
    this.emailSaving.set(true);
    this.emailError.set(null);
    this.authService.changeEmail(currentPassword!, newEmail!).pipe(
      catchError((err: { error?: { message?: string }; message?: string }) => {
        this.emailError.set(err?.error?.message ?? 'Failed to update email');
        this.emailSaving.set(false);
        return EMPTY;
      })
    ).subscribe(({ email }) => {
      this.emailSaving.set(false);
      this.emailForm.reset();
      this.store.dispatch(restoreSession({ user: { ...currentUser, email } }));
      this.messageService.add({ severity: 'success', summary: 'Email updated successfully' });
    });
  }

  submitPasswordChange(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.passwordSaving.set(true);
    this.passwordError.set(null);
    this.authService.changePassword(currentPassword!, newPassword!).pipe(
      catchError((err: { error?: { message?: string }; message?: string }) => {
        this.passwordError.set(err?.error?.message ?? 'Failed to change password');
        this.passwordSaving.set(false);
        return EMPTY;
      })
    ).subscribe(() => {
      this.passwordSaving.set(false);
      this.passwordForm.reset();
      this.messageService.add({ severity: 'success', summary: 'Password changed successfully' });
    });
  }
}
