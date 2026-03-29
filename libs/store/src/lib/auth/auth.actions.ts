import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AdminUser } from '@myorg/models';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ email: string; password: string }>(),
    'Login Success': props<{ user: AdminUser }>(),
    'Login Failure': props<{ error: string }>(),
    'Logout': emptyProps(),
    'Restore Session': props<{ token: string }>(),
  },
});
