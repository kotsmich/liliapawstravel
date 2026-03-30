import { createSelector } from '@ngrx/store';
import { selectRequestsState } from './requests.reducer';
import { TripRequest } from '@models/lib/trip-request.model';

export const selectAllRequests = createSelector(selectRequestsState, (s) => s.requests);
export const selectRequestsIsLoading = createSelector(selectRequestsState, (s) => s.loading);
export const selectPendingRequestsCount = createSelector(
  selectAllRequests,
  (requests) => requests.filter((r) => r.status === 'pending').length
);

/**
 * Factory selector — call once and cache the returned selector instance per tripId
 * to preserve memoization. The result is sorted by submittedAt descending.
 */
export const selectRequestsByTripId = (tripId: string) =>
  createSelector(selectAllRequests, (requests: TripRequest[]) => {
    const filtered = requests.filter((r) => r.tripId === tripId);
    // Only allocate a new sorted array; the underlying filter already creates a new ref
    // when the source requests array changes.
    return filtered.slice().sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  });
