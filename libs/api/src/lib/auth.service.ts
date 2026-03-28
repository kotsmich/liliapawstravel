import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AdminUser } from '@myorg/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = '/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AdminUser> {
    if (email === 'admin@liliapaws.com' && password === 'admin123') {
      return of({
        id: '1',
        email,
        token: 'mock-jwt-token-' + crypto.randomUUID(),
      }).pipe(delay(800));
    }
    return throwError(() => new Error('Invalid credentials. Use admin@liliapaws.com / admin123'));
  }

  logout(): Observable<void> {
    return of(undefined).pipe(delay(100));
  }
}
