import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

export const userApiInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  let modifiedReq = req;

  if (!(req.body instanceof FormData)) {
    modifiedReq = req.clone({
      headers: req.headers.set('Content-Type', 'application/json'),
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        messageService.add({
          severity: 'error',
          summary: 'Connection Error',
          detail: 'Please check your connection',
        });
      }
      if (error.status === 409) {
        return throwError(() => ({
          ...error,
          userMessage: 'This trip is full or your request already exists',
        }));
      }
      if (error.status >= 500) {
        messageService.add({
          severity: 'error',
          summary: 'Server Error',
          detail: 'Something went wrong',
        });
      }
      return throwError(() => error);
    }),
  );
};
