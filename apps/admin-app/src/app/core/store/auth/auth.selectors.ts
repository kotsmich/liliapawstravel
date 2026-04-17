import { createSelector } from '@ngrx/store';
import { selectAuthState } from './auth.reducer';

export const selectCurrentUser = createSelector(selectAuthState, (state) => state.user);
export const selectAuthIsLoading = createSelector(selectAuthState, (state) => state.loading);
