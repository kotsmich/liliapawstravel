import { Routes } from '@angular/router';

export const TRIP_REQUEST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./trip-request.component').then((m) => m.TripRequestComponent),
  },
];
