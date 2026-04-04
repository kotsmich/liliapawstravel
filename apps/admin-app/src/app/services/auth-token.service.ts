import { Injectable } from '@angular/core';

const TOKEN_KEY = 'admin_token';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  saveToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}
