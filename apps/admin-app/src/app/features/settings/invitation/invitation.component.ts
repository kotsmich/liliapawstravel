import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { catchError, EMPTY } from 'rxjs';
import { AuthService } from '@admin/services/auth.service';
import { AdminRole } from '@models/lib/admin-user.model';

@Component({
  selector: 'app-invitation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, TranslocoModule,
    InputTextModule, PasswordModule, ButtonModule,
    SelectModule, IftaLabelModule, MessageModule,
  ],
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
})
export class InvitationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  userSaving = signal(false);
  userError = signal<string | null>(null);

  newUserForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['operator' as AdminRole, Validators.required],
  });

  roleOptions = [
    { label: 'Admin', value: 'admin' as AdminRole },
    { label: 'Operator', value: 'operator' as AdminRole },
  ];

  submitCreateUser(): void {
    if (this.newUserForm.invalid) { this.newUserForm.markAllAsTouched(); return; }
    const { email, password, role } = this.newUserForm.value;
    this.userSaving.set(true);
    this.userError.set(null);
    this.authService.createUser(email!, password!, role as AdminRole).pipe(
      catchError((err: { error?: { message?: string }; message?: string }) => {
        this.userError.set(err?.error?.message ?? 'Failed to create user');
        this.userSaving.set(false);
        return EMPTY;
      })
    ).subscribe(() => {
      this.userSaving.set(false);
      this.newUserForm.reset({ role: 'operator' });
      this.messageService.add({ severity: 'success', summary: 'User created successfully' });
    });
  }
}
