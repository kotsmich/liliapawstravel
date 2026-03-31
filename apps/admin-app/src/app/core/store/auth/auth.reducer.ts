import { createFeature, createReducer, on } from '@ngrx/store';
import { AdminUser } from '@models/lib/admin-user.model';
import { login, loginSuccess, loginFailure, logout, restoreSession } from './auth.actions';

export interface AuthState {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,
    on(login, (s) => ({ ...s, loading: true, error: null })),
    on(loginSuccess, (s, { token, user }) => ({
      ...s, token, user, isAuthenticated: true, loading: false, error: null,
    })),
    on(loginFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(logout, () => ({ ...initialState })),
    on(restoreSession, (s, { user }) => ({
      ...s, user, isAuthenticated: true,
    }))
  ),
});

export const {
  name: authFeatureName,
  reducer: authReducer,
  selectAuthState,
  selectUser,
  selectIsAuthenticated,
  selectLoading: selectAuthLoading,
  selectError: selectAuthError,
} = authFeature;
