import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminUser } from '@models/lib/admin-user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(
    email: string,
    password: string,
  ): Observable<{ token: string; user: AdminUser }> {
    return this.http.post<{ token: string; user: AdminUser }>(
      '/api/auth/login',
      { email, password },
    );
  }

  getProfile(): Observable<AdminUser> {
    return this.http.get<AdminUser>('/api/auth/profile');
  }
}
