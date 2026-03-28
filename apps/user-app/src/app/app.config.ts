import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { MessageService } from 'primeng/api';

import { APP_ROUTES } from './app.routes';
import {
  calendarReducer,
  contactReducer,
  tripRequestReducer,
  CalendarEffects,
  ContactEffects,
  TripRequestEffects,
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
    provideRouter(APP_ROUTES, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideStore({
      calendar: calendarReducer,
      contact: contactReducer,
      tripRequest: tripRequestReducer,
    }),
    provideEffects([CalendarEffects, ContactEffects, TripRequestEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    providePrimeNG({
      theme: {
        preset: LiliaPreset,
        options: { darkModeSelector: false },
      },
      ripple: true,
    }),
    MessageService,
  ],
};
