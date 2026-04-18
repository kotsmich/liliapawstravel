import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { environment } from '../../environments/environment';
import { logout } from '@admin/core/store/auth';

export const adminApiInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const store = inject(Store);

  const modifiedReq = req.url.startsWith(environment.apiUrl)
    ? req.clone({ withCredentials: true })
    : req;

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        store.dispatch(logout());
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
