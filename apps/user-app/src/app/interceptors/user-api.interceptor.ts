import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { httpConnectionError, httpServerError } from '@user/core/toast/toast.actions';

export const userApiInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  let modifiedReq = req;

  if (!(req.body instanceof FormData)) {
    modifiedReq = req.clone({
      headers: req.headers.set('Content-Type', 'application/json'),
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        store.dispatch(httpConnectionError());
      }
      if (error.status >= 500) {
        store.dispatch(httpServerError({ status: error.status }));
      }
      return throwError(() => error);
    }),
  );
};
