import { createSelector } from '@ngrx/store';
import { selectRequestsState } from './requests.reducer';

export const selectAllRequests = createSelector(selectRequestsState, (s) => s.requests);
export const selectRequestsIsLoading = createSelector(selectRequestsState, (s) => s.loading);
export const selectPendingRequestsCount = createSelector(
  selectAllRequests,
  (requests) => requests.filter((r) => r.status === 'pending').length
);
export const selectRequestsByTripId = (tripId: string) =>
  createSelector(selectAllRequests, (requests) =>
    [...requests]
      .filter((r) => r.tripId === tripId)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
  );
