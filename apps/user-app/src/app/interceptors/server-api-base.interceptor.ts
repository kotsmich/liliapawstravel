import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

// SSR-only: Node fetch rejects relative URLs, so prefix /api and /ws requests
// with the absolute backend base. Mirrors API_TARGET in apps/user-app/src/server.ts.
export const serverApiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isPlatformServer(inject(PLATFORM_ID))) {
    return next(req);
  }

  if (!req.url.startsWith('/api') && !req.url.startsWith('/ws')) {
    return next(req);
  }

  const base =
    (typeof process !== 'undefined' && process.env['API_TARGET']) ||
    'http://api:3000';

  return next(req.clone({ url: `${base}${req.url}` }));
};
