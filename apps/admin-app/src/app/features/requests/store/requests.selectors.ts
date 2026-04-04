import { createSelector, MemoizedSelector } from '@ngrx/store';
import { selectRequestsState } from './requests.reducer';
import { TripRequest } from '@models/lib/trip-request.model';

export const selectAllRequests = createSelector(selectRequestsState, (s) => s.requests);
export const selectRequestsIsLoading = createSelector(selectRequestsState, (s) => s.loading);
export const selectSelectedRequests = createSelector(selectRequestsState, (s) => s.selectedRequests);
export const selectSelectedTripId = createSelector(selectRequestsState, (s) => s.selectedTripId);
export const selectPendingRequestsCount = createSelector(
  selectAllRequests,
  (requests) => requests.filter((r) => r.status === 'pending').length
);

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
          .filter((r) => r.tripId === tripId)
          .slice()
          .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      )
    );
  }
  return _cache.get(tripId)!;
};
