import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { AuthService } from '@admin/services/auth.service';
import { extractError } from '@admin/shared/utils/extract-error';
import {
  loadUsers, loadUsersSuccess, loadUsersFailure,
  createUser, createUserSuccess, createUserFailure,
  updateUser, updateUserSuccess, updateUserFailure,
  deleteUser, deleteUserSuccess, deleteUserFailure,
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

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createUser),
      mergeMap(({ email, password, role }) =>
        this.authService.createUser(email, password, role).pipe(
          map((user) => createUserSuccess({ user })),
          catchError((error) => of(createUserFailure({ error: extractError(error) })))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUser),
      mergeMap(({ id, changes }) =>
        this.authService.updateUser(id, changes).pipe(
          map((user) => updateUserSuccess({ user })),
          catchError((error) => of(updateUserFailure({ error: extractError(error) })))
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteUser),
      mergeMap(({ id }) =>
        this.authService.deleteUser(id).pipe(
          map(() => deleteUserSuccess({ id })),
          catchError((error) => of(deleteUserFailure({ error: extractError(error) })))
        )
      )
    )
  );
}
