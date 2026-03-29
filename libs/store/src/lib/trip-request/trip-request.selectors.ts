import { createSelector } from '@ngrx/store';
import { selectTripRequestState } from './trip-request.reducer';

export const selectTripRequestIsLoading = createSelector(selectTripRequestState, (s) => s.loading);
export const selectTripRequestIsSuccess = createSelector(selectTripRequestState, (s) => s.success);
export const selectTripRequestHasError = createSelector(selectTripRequestState, (s) => s.error);
export const selectAllRequests = createSelector(selectTripRequestState, (s) => s.requests);
export const selectRequestsIsLoading = createSelector(selectTripRequestState, (s) => s.requestsLoading);
export const selectPendingRequestsCount = createSelector(
  selectAllRequests,
  (requests) => requests.filter((r) => r.status === 'pending').length
);
export const selectApprovedRequestsCount = createSelector(
  selectAllRequests,
  (requests) => requests.filter((r) => r.status === 'approved').length
);
export const selectRejectedRequestsCount = createSelector(
  selectAllRequests,
  (requests) => requests.filter((r) => r.status === 'rejected').length
);
export const selectRequestsByTripId = (tripId: string) =>
  createSelector(selectAllRequests, (requests) =>
    [...requests]
      .filter((r) => r.tripId === tripId)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
  );
