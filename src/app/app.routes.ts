import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'contact',
    loadChildren: () =>
      import('./features/contact/contact.routes').then((m) => m.CONTACT_ROUTES),
  },
  {
    path: 'request',
    loadChildren: () =>
      import('./features/trip-request/trip-request.routes').then(
        (m) => m.TRIP_REQUEST_ROUTES
      ),
  },
  { path: '**', redirectTo: '' },
];
