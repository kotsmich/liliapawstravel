import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MessageModule } from 'primeng/message';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { AdminRole } from '@models/lib/admin-user.model';
import { ValidationErrorDirective } from '@ui/lib/directives/validation-error.directive';
import { AsyncButtonDirective } from '@ui/lib/directives/async-button.directive';
import { createUser, createUserSuccess } from '../users/store/users.actions';
import { selectUsersCreating, selectUsersCreateError } from '../users/store/users.selectors';

@Component({
  selector: 'app-invitation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, TranslocoModule,
    InputTextModule, PasswordModule, ButtonModule,
    SelectModule, IftaLabelModule, MessageModule,
    ValidationErrorDirective, AsyncButtonDirective,
  ],
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
})
export class InvitationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);

  userSaving = toSignal(this.store.select(selectUsersCreating), { initialValue: false });
  userError = toSignal(this.store.select(selectUsersCreateError), { initialValue: null });

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
    this.store.dispatch(createUser({ email: email!, password: password!, role: role as AdminRole }));
    this.actions$.pipe(ofType(createUserSuccess), take(1)).subscribe(() => {
      this.newUserForm.reset({ role: 'operator' });
    });
  }
}
