import { createSelector } from '@ngrx/store';
import { selectContactState } from './contact.reducer';

export const selectContactIsLoading = createSelector(
  selectContactState,
  (state) => state.loading
);

export const selectContactIsSuccess = createSelector(
  selectContactState,
  (state) => state.success
);

export const selectContactHasError = createSelector(
  selectContactState,
  (state) => state.error
);

export const selectContactLastSubmission = createSelector(
  selectContactState,
  (state) => state.lastSubmission
);
