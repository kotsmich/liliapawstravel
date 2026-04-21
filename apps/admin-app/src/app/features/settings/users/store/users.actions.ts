import { createAction, props } from '@ngrx/store';
import { AdminUser, AdminRole } from '@models/lib/admin-user.model';

export const loadUsers = createAction('[Users] Load Users');
export const loadUsersSuccess = createAction(
  '[Users] Load Users Success',
  props<{ users: AdminUser[] }>()
);
export const loadUsersFailure = createAction(
  '[Users] Load Users Failure',
  props<{ error: string }>()
);

export const updateUser = createAction(
  '[Users] Update User',
  props<{ id: string; changes: { email?: string; role?: AdminRole } }>()
);
export const updateUserSuccess = createAction(
  '[Users] Update User Success',
  props<{ user: AdminUser }>()
);
export const updateUserFailure = createAction(
  '[Users] Update User Failure',
  props<{ error: string }>()
);

export const deleteUser = createAction('[Users] Delete User', props<{ id: string }>());
export const deleteUserSuccess = createAction('[Users] Delete User Success', props<{ id: string }>());
export const deleteUserFailure = createAction('[Users] Delete User Failure', props<{ error: string }>());
