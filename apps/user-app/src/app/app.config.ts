import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from '@user/core/transloco-loader';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { MessageService, ConfirmationService } from 'primeng/api';

import { APP_ROUTES } from './app.routes';
import { userApiInterceptor } from '@user/interceptors/user-api.interceptor';
import { tripsReducer, TripsEffects } from '@user/core/store/trips';
import { calendarReducer } from '@user/core/store/calendar';
import { tripRequestReducer, TripRequestEffects } from '@user/features/trip-request/store';
import { contactReducer, ContactEffects } from '@user/features/contact/store';
import { NotificationEffects } from '@user/core/toast/notification.effects';

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
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([userApiInterceptor])),
    provideStore({
      calendar: calendarReducer,
      contact: contactReducer,
      tripRequest: tripRequestReducer,
      trips: tripsReducer,
    }),
    provideEffects([ContactEffects, TripRequestEffects, TripsEffects, NotificationEffects]),
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
    provideTransloco({
      config: {
        availableLangs: ['en', 'el', 'de'],
        defaultLang: 'el',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ],
};
