import { createAction, props } from '@ngrx/store';
import { AdminUser } from '@models/lib/admin-user.model';

export const login = createAction('[Auth] Login', props<{ email: string; password: string }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ token: string; user: AdminUser }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const logout = createAction('[Auth] Logout');
export const restoreSession = createAction('[Auth] Restore Session', props<{ user: AdminUser }>());
