import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from '@user/core/transloco-loader';
import { provideRouter, withRouterConfig, withPreloading, PreloadAllModules, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
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
      50:  '#f5f1ec',
      100: '#e8e0d8',
      200: '#c6b29e',
      300: '#c3b8a9',
      400: '#aba092',
      500: '#998c7c',
      600: '#837a6f',
      700: '#6b6259',
      800: '#524b43',
      900: '#3b352e',
      950: '#28221c',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideRouter(
      APP_ROUTES,
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([userApiInterceptor])),
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
