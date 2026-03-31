import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { environment } from '../../environments/environment';

export const adminApiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);

  const modifiedReq = req.url.startsWith(environment.apiUrl)
    ? req.clone({ withCredentials: true })
    : req;

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
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
