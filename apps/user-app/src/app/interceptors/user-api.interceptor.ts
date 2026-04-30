import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { httpConnectionError, httpServerError } from '@user/core/toast/toast.actions';

export const userApiInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const isServer = isPlatformServer(inject(PLATFORM_ID));

  let modifiedReq = req;

  if (!(req.body instanceof FormData)) {
    modifiedReq = req.clone({
      headers: req.headers.set('Content-Type', 'application/json'),
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip toast dispatch during SSR — toasts are browser-only UI, and
      // dispatching them server-side triggers Transloco missing-translation
      // warnings because lang bundles aren't loaded into its runtime cache yet.
      if (!isServer) {
        if (error.status === 0) {
          store.dispatch(httpConnectionError());
        }
        if (error.status >= 500) {
          store.dispatch(httpServerError({ status: error.status }));
        }
      }
      return throwError(() => error);
    }),
  );
};
