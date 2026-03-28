import { createSelector } from '@ngrx/store';
import { selectTripRequestState } from './trip-request.reducer';

export const selectAllSubmissions = createSelector(
  selectTripRequestState,
  (state) => state.submissions
);

export const selectTripRequestIsLoading = createSelector(
  selectTripRequestState,
  (state) => state.loading
);

export const selectTripRequestIsSuccess = createSelector(
  selectTripRequestState,
  (state) => state.success
);

export const selectTripRequestHasError = createSelector(
  selectTripRequestState,
  (state) => state.error
);
