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
