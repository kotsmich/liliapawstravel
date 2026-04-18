import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminUser, AdminRole } from '@models/lib/admin-user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  login(email: string, password: string): Observable<{ user: AdminUser }> {
    return this.http.post<{ user: AdminUser }>(`${this.baseUrl}/login`, { email, password });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }

  getProfile(): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.baseUrl}/me`);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/profile/password`, { currentPassword, newPassword });
  }

  changeEmail(currentPassword: string, newEmail: string): Observable<{ email: string }> {
    return this.http.patch<{ email: string }>(`${this.baseUrl}/profile/email`, { currentPassword, newEmail });
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/users`);
  }

  updateUser(id: string, data: { email?: string; role?: AdminRole }): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.baseUrl}/users/${id}`, data);
  }

  createUser(email: string, password: string, role: AdminRole): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.baseUrl}/users`, { email, password, role });
  }
}
