import { createSelector } from '@ngrx/store';
import { selectTripRequestState } from './trip-request.reducer';

export const selectTripRequestIsLoading = createSelector(selectTripRequestState, (s) => s.loading);
export const selectTripRequestIsSuccess = createSelector(selectTripRequestState, (s) => s.success);
// selectTripRequestError is exported directly from trip-request.reducer via createFeature
