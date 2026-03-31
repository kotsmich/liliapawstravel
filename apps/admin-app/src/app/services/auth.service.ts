import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminUser } from '@models/lib/admin-user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ token: string; user: { id: string; email: string } }> {
    return this.http.post<{ token: string; user: { id: string; email: string } }>(`${this.baseUrl}/login`, { email, password });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }

  getProfile(): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.baseUrl}/me`);
  }
}
