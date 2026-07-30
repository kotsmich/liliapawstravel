import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { tripResultsFeature, TripResultsEffects } from '@user/core/store/trip-results';

export const TRIP_RESULTS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState(tripResultsFeature),
      provideEffects(TripResultsEffects),
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./trip-results-list/trip-results-list.component').then((m) => m.TripResultsListComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./trip-result-gallery/trip-result-gallery.component').then((m) => m.TripResultGalleryComponent),
      },
    ],
  },
];
