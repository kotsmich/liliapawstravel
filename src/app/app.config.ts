import { ApplicationConfig } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';

import { APP_ROUTES } from './app.routes';
import { calendarReducer } from './store/calendar/calendar.reducer';
import { tripRequestReducer } from './store/trip-request/trip-request.reducer';
import { contactReducer } from './store/contact/contact.reducer';
import { CalendarEffects } from './store/calendar/calendar.effects';
import { TripRequestEffects } from './store/trip-request/trip-request.effects';
import { ContactEffects } from './store/contact/contact.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideAnimations(),
    provideHttpClient(),
    provideStore({
      calendar: calendarReducer,
      tripRequest: tripRequestReducer,
      contact: contactReducer,
    }),
    provideEffects([CalendarEffects, TripRequestEffects, ContactEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
  ],
};
