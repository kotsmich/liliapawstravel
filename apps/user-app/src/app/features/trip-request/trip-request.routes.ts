import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { tripsFeature, TripsEffects } from '@user/core/store/trips';

export const TRIP_REQUEST_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState(tripsFeature),
      provideEffects(TripsEffects),
    ],
    loadComponent: () => import('./trip-request.component').then((m) => m.TripRequestComponent),
  },
];
