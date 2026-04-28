import { createAction, props } from '@ngrx/store';
import { AdminUser } from '@models/lib/admin-user.model';

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: AdminUser }>()
);
export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');
export const restoreSession = createAction(
  '[Auth] Restore Session',
  props<{ user: AdminUser }>()
);

export const changeEmail = createAction(
  '[Auth] Change Email',
  props<{ currentPassword: string; newEmail: string }>()
);
export const changeEmailSuccess = createAction(
  '[Auth] Change Email Success',
  props<{ email: string }>()
);
export const changeEmailFailure = createAction(
  '[Auth] Change Email Failure',
  props<{ error: string }>()
);

export const changePassword = createAction(
  '[Auth] Change Password',
  props<{ currentPassword: string; newPassword: string }>()
);
export const changePasswordSuccess = createAction('[Auth] Change Password Success');
export const changePasswordFailure = createAction(
  '[Auth] Change Password Failure',
  props<{ error: string }>()
);
