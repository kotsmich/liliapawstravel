import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminUser } from '@myorg/models';
import { API_URL } from './api-url.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${inject(API_URL)}/api/auth`;

  login(email: string, password: string): Observable<AdminUser> {
    return this.http
      .post<{ token: string }>(`${this.base}/login`, { email, password })
      .pipe(map(({ token }) => ({ id: email, email, token })));
  }

  logout(): Observable<void> {
    // Stateless JWT — nothing to call on the server
    return new Observable((observer) => { observer.next(); observer.complete(); });
  }
}
