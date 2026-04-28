import { Routes } from '@angular/router';

export const TRANSPORT_DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./transport-documents.component').then((m) => m.TransportDocumentsComponent),
  },
];
