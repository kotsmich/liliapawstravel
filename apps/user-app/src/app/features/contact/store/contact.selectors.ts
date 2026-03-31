import { createSelector } from '@ngrx/store';
import { selectContactState } from './contact.reducer';

export const selectContactIsLoading = createSelector(selectContactState, (s) => s.loading);
export const selectContactIsSuccess = createSelector(selectContactState, (s) => s.success);
// selectContactError is exported directly from contact.reducer via createFeature
