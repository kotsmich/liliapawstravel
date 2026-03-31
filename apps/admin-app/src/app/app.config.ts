import { ApplicationConfig, APP_INITIALIZER, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { MessageService, ConfirmationService } from 'primeng/api';
import { firstValueFrom, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { APP_ROUTES } from './app.routes';
import { adminApiInterceptor } from '@admin/interceptors/admin-api.interceptor';
import { authReducer, AuthEffects, AuthActions } from '@admin/store/auth';
import { tripsReducer, TripsEffects } from '@admin/store/trips';
import { calendarReducer } from '@admin/store/calendar';
import { requestsReducer, RequestsEffects } from '@admin/store/requests';
import { messagesReducer, MessagesEffects } from '@admin/store/messages';
import { notificationsReducer } from '@admin/store/notifications';
import { AuthService } from '@admin/services/auth.service';

const LiliaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#fdf4ef',
      100: '#fbe4d4',
      200: '#f5c5a3',
      300: '#eda07a',
      400: '#e68a62',
      500: '#e07b54',
      600: '#c9623b',
      700: '#a34d2f',
      800: '#7d3a23',
      900: '#5c2a19',
      950: '#3d1a0e',
    },
  },
});

function initializeAuth(store: Store, authService: AuthService): () => Promise<void> {
  return () =>
    firstValueFrom(
      authService.getProfile().pipe(
        tap((user) => store.dispatch(AuthActions.restoreSession({ user }))),
        catchError(() => of(null)),
      ),
    ).then(() => undefined);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([adminApiInterceptor])),
    provideStore({
      auth: authReducer,
      trips: tripsReducer,
      calendar: calendarReducer,
      requests: requestsReducer,
      messages: messagesReducer,
      notifications: notificationsReducer,
    }),
    provideEffects([AuthEffects, TripsEffects, RequestsEffects, MessagesEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    providePrimeNG({
      theme: {
        preset: LiliaPreset,
        options: { darkModeSelector: false },
      },
      ripple: true,
    }),
    MessageService,
    ConfirmationService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [Store, AuthService],
      multi: true,
    },
  ],
};
