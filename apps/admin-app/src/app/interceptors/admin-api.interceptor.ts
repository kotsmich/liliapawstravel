import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { environment } from '../../environments/environment';
import { AuthTokenService } from '@admin/services/auth-token.service';
import { logout } from '@admin/core/store/auth';

export const adminApiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const store = inject(Store);
  const tokenService = inject(AuthTokenService);

  let modifiedReq = req;
  if (req.url.startsWith(environment.apiUrl)) {
    const token = tokenService.getToken();
    modifiedReq = req.clone({
      withCredentials: true,
      ...(token ? { setHeaders: { Authorization: `Bearer ${token}` } } : {}),
    });
  }

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
