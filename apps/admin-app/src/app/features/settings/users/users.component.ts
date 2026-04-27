import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { AdminUser, AdminRole } from '@models/lib/admin-user.model';
import { ValidationErrorDirective } from '@ui/lib/directives/validation-error.directive';
import { AsyncButtonDirective } from '@ui/lib/directives/async-button.directive';
import { ConfirmActionService } from '@admin/shared/services/confirm-action.service';
import { selectCurrentUser } from '@admin/core/store/auth';
import {
  loadUsers,
  updateUser, updateUserSuccess, updateUserFailure,
  deleteUser, deleteUserSuccess, deleteUserFailure,
} from './store/users.actions';
import { selectUsers, selectUsersLoading } from './store/users.selectors';

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
  private readonly messageService = inject(MessageService);
  private readonly confirm = inject(ConfirmActionService);
  private readonly transloco = inject(TranslocoService);
  private readonly fb = inject(FormBuilder);

  users = toSignal(this.store.select(selectUsers), { initialValue: [] as AdminUser[] });
  loading = toSignal(this.store.select(selectUsersLoading), { initialValue: false });
  currentUser = toSignal(this.store.select(selectCurrentUser), { initialValue: null as AdminUser | null });
  saving = signal(false);
  error = signal<string | null>(null);
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
    this.error.set(null);
    this.editDialogVisible.set(true);
  }

  saveUser(): void {
    if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
    const user = this.editingUser();
    if (!user) return;
    const { email, role } = this.editForm.value;
    this.saving.set(true);
    this.error.set(null);
    this.store.dispatch(updateUser({ id: user.id, changes: { email: email!, role: role as AdminRole } }));
    this.actions$.pipe(ofType(updateUserSuccess, updateUserFailure), take(1)).subscribe((action) => {
      if (action.type === updateUserSuccess.type) {
        this.editDialogVisible.set(false);
        this.messageService.add({ severity: 'success', summary: 'User updated successfully' });
      } else {
        this.error.set((action as ReturnType<typeof updateUserFailure>).error ?? 'Failed to update user');
      }
      this.saving.set(false);
    });
  }

  deleteUser(user: AdminUser): void {
    this.confirm.confirm({
      header: this.transloco.translate('settings.deleteUser'),
      message: this.transloco.translate('settings.confirmDeleteUser', { email: user.email }),
      acceptLabel: this.transloco.translate('common.delete'),
      severity: 'danger',
      accept: () => {
        this.store.dispatch(deleteUser({ id: user.id }));
        this.actions$.pipe(ofType(deleteUserSuccess, deleteUserFailure), take(1)).subscribe((action) => {
          if (action.type === deleteUserSuccess.type) {
            this.messageService.add({ severity: 'success', summary: 'User deleted successfully' });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: (action as ReturnType<typeof deleteUserFailure>).error ?? 'Failed to delete user',
            });
          }
        });
      },
    });
  }

  isSelf(user: AdminUser): boolean {
    return this.currentUser()?.id === user.id;
  }
}
