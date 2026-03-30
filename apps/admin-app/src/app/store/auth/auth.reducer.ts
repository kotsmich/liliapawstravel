import { createFeature, createReducer, on } from '@ngrx/store';
import { AdminUser } from '@models/lib/admin-user.model';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,
    on(AuthActions.login, (s) => ({ ...s, loading: true, error: null })),
    on(AuthActions.loginSuccess, (s, { user }) => ({
      ...s, user, token: user.token, isAuthenticated: true, loading: false, error: null,
    })),
    on(AuthActions.loginFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(AuthActions.logout, () => ({ ...initialState })),
    on(AuthActions.restoreSession, (s, { token }) => ({
      ...s, token, isAuthenticated: true, user: { id: 'admin', email: '', token },
    }))
  ),
});

export const {
  name: authFeatureName,
  reducer: authReducer,
  selectAuthState,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectLoading: selectAuthLoading,
  selectError: selectAuthError,
} = authFeature;
