import { createSelector } from '@ngrx/store';
import { selectTripRequestState } from './trip-request.reducer';

export const selectTripRequestIsLoading = createSelector(selectTripRequestState, (s) => s.loading);
export const selectTripRequestIsSuccess = createSelector(selectTripRequestState, (s) => s.success);
export const selectTripRequestHasError = createSelector(selectTripRequestState, (s) => s.error);
export const selectAllRequests = createSelector(selectTripRequestState, (s) => s.requests);
export const selectRequestsIsLoading = createSelector(selectTripRequestState, (s) => s.requestsLoading);
