import { createSelector } from '@ngrx/store';
import { selectAuthState } from './auth.reducer';

// selectIsAuthenticated, selectAuthError are already exported from auth.reducer via createFeature
export const selectCurrentUser = createSelector(selectAuthState, (s) => s.user);
export const selectAuthToken = createSelector(selectAuthState, (s) => s.token);
export const selectAuthIsLoading = createSelector(selectAuthState, (s) => s.loading);
