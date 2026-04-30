import { Routes } from '@angular/router';

export const NOT_FOUND_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./not-found.component').then((m) => m.NotFoundComponent) },
];
