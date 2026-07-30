import { Routes } from '@angular/router';
import { langGuard } from '@user/core/guards/lang.guard';
import { DEFAULT_LANG } from '@user/core/i18n/supported-langs';

export const APP_ROUTES: Routes = [
  {
    path: ':lang',
    canActivate: [langGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
      },
      {
        path: 'about',
        loadChildren: () => import('./features/about/about.routes').then((m) => m.ABOUT_ROUTES),
      },
      {
        path: 'contact',
        loadChildren: () => import('./features/contact/contact.routes').then((m) => m.CONTACT_ROUTES),
      },
      {
        path: 'request',
        loadChildren: () =>
          import('./features/trip-request/trip-request.routes').then((m) => m.TRIP_REQUEST_ROUTES),
      },
      {
        path: 'results',
        loadChildren: () =>
          import('./features/trip-results/trip-results.routes').then((m) => m.TRIP_RESULTS_ROUTES),
      },
      {
        path: 'transport-documents',
        loadChildren: () =>
          import('./features/transport-documents/transport-documents.routes').then(
            (m) => m.TRANSPORT_DOCUMENTS_ROUTES,
          ),
      },
      {
        path: 'faq',
        loadChildren: () => import('./features/faq/faq.routes').then((m) => m.FAQ_ROUTES),
      },
      {
        path: '**',
        loadChildren: () => import('./features/not-found/not-found.routes').then((m) => m.NOT_FOUND_ROUTES),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: `/${DEFAULT_LANG}` },
  { path: '**', redirectTo: `/${DEFAULT_LANG}/404` },
];
