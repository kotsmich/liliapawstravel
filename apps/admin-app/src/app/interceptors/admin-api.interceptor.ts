import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

export const adminApiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const token = localStorage.getItem('admin_token');

  let modifiedReq = req;

  if (token) {
    modifiedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_token_expiry');
        router.navigate(['/admin/login']);
      }
      if (error.status === 403) {
        messageService.add({
          severity: 'error',
          summary: 'Forbidden',
          detail: 'You do not have permission',
        });
      }
      return throwError(() => error);
    }),
  );
};
