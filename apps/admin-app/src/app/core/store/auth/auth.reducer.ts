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
    on(login, (state) => ({ ...state, loading: true, error: null })),
    on(loginSuccess, (state, { token, user }) => ({
      ...state, token, user, isAuthenticated: true, loading: false, error: null,
    })),
    on(loginFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(logout, () => ({ ...initialState })),
    on(restoreSession, (state, { user }) => ({
      ...state, user, isAuthenticated: true,
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
