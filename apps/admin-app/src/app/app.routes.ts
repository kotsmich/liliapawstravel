import { Routes } from '@angular/router';
import { authGuard } from '@admin/guards/auth.guard';

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'trips',
        loadComponent: () => import('./features/trips/trips-list/trips-list.component').then((m) => m.TripsListComponent),
      },
      {
        path: 'trips/new',
        loadComponent: () => import('./features/trips/trip-form/trip-form.component').then((m) => m.TripFormComponent),
      },
      {
        path: 'trips/:id/edit',
        loadComponent: () => import('./features/trips/trip-form/trip-form.component').then((m) => m.TripFormComponent),
      },
      {
        path: 'requests',
        loadComponent: () => import('./features/requests/requests-list.component').then((m) => m.RequestsListComponent),
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/messages/messages-page.component').then((m) => m.MessagesPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'admin/login' },
];
