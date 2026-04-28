import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MessageModule } from 'primeng/message';
import { toSignal } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { signal } from '@angular/core';
import { AdminUser, AdminRole } from '@models/lib/admin-user.model';
import { ValidationErrorDirective } from '@ui/lib/directives/validation-error.directive';
import { AsyncButtonDirective } from '@ui/lib/directives/async-button.directive';
import { ConfirmActionService } from '@admin/shared/services/confirm-action.service';
import { selectCurrentUser } from '@admin/core/store/auth';
import {
  loadUsers,
  updateUser, updateUserSuccess,
  deleteUser,
} from './store/users.actions';
import {
  selectUsers, selectUsersLoading,
  selectUsersUpdating, selectUsersUpdateError,
} from './store/users.selectors';

@Component({
  selector: 'app-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, TranslocoModule,
    TableModule, ButtonModule, DialogModule, ConfirmDialogModule,
    SelectModule, InputTextModule, IftaLabelModule, MessageModule,
    ValidationErrorDirective, AsyncButtonDirective,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly confirm = inject(ConfirmActionService);
  private readonly transloco = inject(TranslocoService);
  private readonly fb = inject(FormBuilder);

  users = toSignal(this.store.select(selectUsers), { initialValue: [] as AdminUser[] });
  loading = toSignal(this.store.select(selectUsersLoading), { initialValue: false });
  currentUser = toSignal(this.store.select(selectCurrentUser), { initialValue: null as AdminUser | null });
  saving = toSignal(this.store.select(selectUsersUpdating), { initialValue: false });
  error = toSignal(this.store.select(selectUsersUpdateError), { initialValue: null });
  editDialogVisible = signal(false);
  editingUser = signal<AdminUser | null>(null);

  editForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['operator' as AdminRole, Validators.required],
  });

  roleOptions = [
    { label: 'Admin', value: 'admin' as AdminRole },
    { label: 'Operator', value: 'operator' as AdminRole },
  ];

  ngOnInit(): void {
    this.store.dispatch(loadUsers());
  }

  openEdit(user: AdminUser): void {
    this.editingUser.set(user);
    this.editForm.setValue({ email: user.email, role: user.role });
    this.editDialogVisible.set(true);
  }

  saveUser(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const user = this.editingUser();
    if (!user) return;
    const { email, role } = this.editForm.value;
    this.store.dispatch(updateUser({ id: user.id, changes: { email: email!, role: role as AdminRole } }));
    this.actions$.pipe(ofType(updateUserSuccess), take(1)).subscribe(() => {
      this.editDialogVisible.set(false);
    });
  }

  deleteUser(user: AdminUser): void {
    this.confirm.confirm({
      header: this.transloco.translate('settings.deleteUser'),
      message: this.transloco.translate('settings.confirmDeleteUser', { email: user.email }),
      acceptLabel: this.transloco.translate('common.delete'),
      severity: 'danger',
      accept: () => this.store.dispatch(deleteUser({ id: user.id })),
    });
  }

  isSelf(user: AdminUser): boolean {
    return this.currentUser()?.id === user.id;
  }
}
