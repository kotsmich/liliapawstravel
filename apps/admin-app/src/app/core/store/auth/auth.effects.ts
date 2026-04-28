import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { AuthService } from '@admin/services/auth.service';
import { extractError } from '@admin/shared/utils/extract-error';
import {
  login, loginSuccess, loginFailure, logout,
  changeEmail, changeEmailSuccess, changeEmailFailure,
  changePassword, changePasswordSuccess, changePasswordFailure,
} from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(({ user }) => loginSuccess({ user })),
          catchError((error) => of(loginFailure({ error: extractError(error) })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(() => this.router.navigate(['/admin/dashboard']))
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        switchMap(() =>
          this.authService.logout().pipe(
            catchError(() => of(null))
          )
        ),
        tap(() => this.router.navigate(['/admin/login']))
      ),
    { dispatch: false }
  );

  changeEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changeEmail),
      mergeMap(({ currentPassword, newEmail }) =>
        this.authService.changeEmail(currentPassword, newEmail).pipe(
          map(({ email }) => changeEmailSuccess({ email })),
          catchError((error) => of(changeEmailFailure({ error: extractError(error) })))
        )
      )
    )
  );

  changePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changePassword),
      mergeMap(({ currentPassword, newPassword }) =>
        this.authService.changePassword(currentPassword, newPassword).pipe(
          map(() => changePasswordSuccess()),
          catchError((error) => of(changePasswordFailure({ error: extractError(error) })))
        )
      )
    )
  );
}
