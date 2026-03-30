import { createSelector } from '@ngrx/store';
import { selectAuthState } from './auth.reducer';

export const selectCurrentUser = createSelector(selectAuthState, (s) => s.user);
export const selectAuthIsLoading = createSelector(selectAuthState, (s) => s.loading);
