import { createSelector } from '@ngrx/store';
import { selectContactState } from './contact.reducer';

export const selectContactIsLoading = createSelector(selectContactState, (s) => s.loading);
export const selectContactIsSuccess = createSelector(selectContactState, (s) => s.success);
export const selectContactHasError = createSelector(selectContactState, (s) => s.error);
