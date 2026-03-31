import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AdminUser } from '@models/lib/admin-user.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ email: string; password: string }>(),
    'Login Success': props<{ token: string; user: AdminUser }>(),
    'Login Failure': props<{ error: string }>(),
    'Logout': emptyProps(),
    'Restore Session': props<{ user: AdminUser }>(),
  },
});
