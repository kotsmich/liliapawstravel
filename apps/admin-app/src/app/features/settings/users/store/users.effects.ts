import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthService } from '@admin/services/auth.service';
import { extractError } from '@admin/shared/utils/extract-error';
import {
  loadUsers, loadUsersSuccess, loadUsersFailure,
  updateUser, updateUserSuccess, updateUserFailure,
} from './users.actions';

@Injectable()
export class UsersEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsers),
      switchMap(() =>
        this.authService.getUsers().pipe(
          map((users) => loadUsersSuccess({ users })),
          catchError((error) => of(loadUsersFailure({ error: extractError(error) })))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUser),
      switchMap(({ id, changes }) =>
        this.authService.updateUser(id, changes).pipe(
          map((user) => updateUserSuccess({ user })),
          catchError((error) => of(updateUserFailure({ error: extractError(error) })))
        )
      )
    )
  );
}
