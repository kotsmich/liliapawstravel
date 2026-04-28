import { createFeature, createReducer, on } from '@ngrx/store';
import { AdminUser } from '@models/lib/admin-user.model';
import {
  login, loginSuccess, loginFailure, logout, restoreSession,
  changeEmail, changeEmailSuccess, changeEmailFailure,
  changePassword, changePasswordSuccess, changePasswordFailure,
} from './auth.actions';

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  emailMutating: boolean;
  emailError: string | null;
  passwordMutating: boolean;
  passwordError: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  emailMutating: false,
  emailError: null,
  passwordMutating: false,
  passwordError: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,
    on(login, (state) => ({ ...state, loading: true, error: null })),
    on(loginSuccess, (state, { user }) => ({
      ...state, user, isAuthenticated: true, loading: false, error: null,
    })),
    on(loginFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(logout, () => ({ ...initialState })),
    on(restoreSession, (state, { user }) => ({
      ...state, user, isAuthenticated: true,
    })),
    on(changeEmail, (state) => ({ ...state, emailMutating: true, emailError: null })),
    on(changeEmailSuccess, (state, { email }) => ({
      ...state,
      emailMutating: false,
      user: state.user ? { ...state.user, email } : state.user,
    })),
    on(changeEmailFailure, (state, { error }) => ({ ...state, emailMutating: false, emailError: error })),
    on(changePassword, (state) => ({ ...state, passwordMutating: true, passwordError: null })),
    on(changePasswordSuccess, (state) => ({ ...state, passwordMutating: false })),
    on(changePasswordFailure, (state, { error }) => ({ ...state, passwordMutating: false, passwordError: error }))
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
  selectEmailMutating,
  selectEmailError,
  selectPasswordMutating,
  selectPasswordError,
} = authFeature;
