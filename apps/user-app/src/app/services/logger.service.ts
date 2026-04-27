import { Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  error(message: string, ...details: unknown[]): void {
    if (isDevMode()) {
      console.error(message, ...details);
    }
  }
}
