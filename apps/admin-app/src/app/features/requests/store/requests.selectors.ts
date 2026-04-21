import { createSelector, MemoizedSelector } from '@ngrx/store';
import { selectRequestsState } from './requests.reducer';
import { TripRequest } from '@models/lib/trip-request.model';

export const selectAllRequests = createSelector(selectRequestsState, (state) => state.requests);
export const selectRequestsIsLoading = createSelector(selectRequestsState, (state) => state.loading);
export const selectSelectedRequestIds = createSelector(selectRequestsState, (state) => state.selectedRequestIds);
export const selectSelectedRequests = createSelector(
  selectAllRequests,
  selectSelectedRequestIds,
  (requests, ids) => requests.filter((request) => ids.includes(request.id))
);
export const selectSelectedTripId = createSelector(selectRequestsState, (state) => state.selectedTripId);
export const selectPendingRequestsCount = createSelector(
  selectAllRequests,
  (requests) => requests.filter((request) => request.status === 'pending').length
);

export const selectFilteredBySelectedTrip = createSelector(
  selectAllRequests,
  selectSelectedTripId,
  (requests, tripId) => (tripId ? requests.filter((r) => r.tripId === tripId) : requests)
);

const selectStatusCounts = createSelector(selectFilteredBySelectedTrip, (requests) => {
  const counts = { pending: 0, approved: 0, rejected: 0, cancelled: 0 };
  for (const r of requests) {
    if (r.status in counts) counts[r.status as keyof typeof counts]++;
  }
  return counts;
});

export const selectPendingCount   = createSelector(selectStatusCounts, (c) => c.pending);
export const selectApprovedCount  = createSelector(selectStatusCounts, (c) => c.approved);
export const selectRejectedCount  = createSelector(selectStatusCounts, (c) => c.rejected);
export const selectCancelledCount = createSelector(selectStatusCounts, (c) => c.cancelled);

/**
 * Factory selector — instances are cached per tripId to preserve memoization.
 * Always call `selectRequestsByTripId(id)` at the class level (field or constructor),
 * never inside a template expression or inside a pipe operator.
 */
const _cache = new Map<string, MemoizedSelector<object, TripRequest[]>>();

export const selectRequestsByTripId = (tripId: string): MemoizedSelector<object, TripRequest[]> => {
  if (!_cache.has(tripId)) {
    _cache.set(
      tripId,
      createSelector(selectAllRequests, (requests: TripRequest[]) =>
        requests
          .filter((request) => request.tripId === tripId)
          .slice()
          .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      )
    );
  }
  return _cache.get(tripId)!;
};

export const clearSelectRequestsByTripIdCache = (): void => _cache.clear();
