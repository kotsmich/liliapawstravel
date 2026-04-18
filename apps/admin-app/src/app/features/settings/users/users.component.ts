import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { catchError, EMPTY } from 'rxjs';
import { AuthService } from '@admin/services/auth.service';
import { AdminUser, AdminRole } from '@models/lib/admin-user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, TranslocoModule,
    TableModule, ButtonModule, DialogModule,
    SelectModule, InputTextModule, IftaLabelModule, MessageModule,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  users = signal<AdminUser[]>([]);
  loading = signal(true);
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
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.authService.getUsers().pipe(
      catchError(() => {
        this.loading.set(false);
        return EMPTY;
      })
    ).subscribe((users) => {
      this.users.set(users);
      this.loading.set(false);
    });
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
    this.authService.updateUser(user.id, { email: email!, role: role as AdminRole }).pipe(
      catchError((err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message ?? 'Failed to update user');
        this.saving.set(false);
        return EMPTY;
      })
    ).subscribe((updated) => {
      this.users.update((list) => list.map((u) => u.id === updated.id ? updated : u));
      this.saving.set(false);
      this.editDialogVisible.set(false);
      this.messageService.add({ severity: 'success', summary: 'User updated successfully' });
    });
  }
}
