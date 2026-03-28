import { createFeature, createReducer, on } from '@ngrx/store';
import { AdminUser } from '@myorg/models';
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
    on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
    on(AuthActions.loginSuccess, (state, { user }) => ({
      ...state,
      user,
      token: user.token,
      isAuthenticated: true,
      loading: false,
      error: null,
    })),
    on(AuthActions.loginFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(AuthActions.logout, () => ({ ...initialState }))
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
