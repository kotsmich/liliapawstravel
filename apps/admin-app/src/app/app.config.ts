import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { MessageService, ConfirmationService } from 'primeng/api';

import { environment } from '../environments/environment';
import { APP_ROUTES } from './app.routes';
import { authInterceptor } from './auth.interceptor';
import { API_URL } from '@myorg/api';
import {
  authReducer, AuthEffects,
  tripsReducer, TripsEffects,
  calendarReducer, CalendarEffects,
  tripRequestReducer, TripRequestEffects,
} from '@myorg/store';

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

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: API_URL, useValue: environment.apiUrl },
    provideStore({
      auth: authReducer,
      trips: tripsReducer,
      calendar: calendarReducer,
      tripRequest: tripRequestReducer,
    }),
    provideEffects([AuthEffects, TripsEffects, CalendarEffects, TripRequestEffects]),
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
  ],
};
