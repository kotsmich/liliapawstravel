import { createSelector } from '@ngrx/store';
import { selectTripsState } from './trips.reducer';

// selectSelectedTrip, selectTripsError, selectTrips, selectTripsLoading, selectTripsMutating
// are already exported from trips.reducer via createFeature
export const selectAllTrips = createSelector(selectTripsState, (s) => s.trips);
export const selectTripsIsLoading = createSelector(selectTripsState, (s) => s.loading);
export const selectTripsIsMutating = createSelector(selectTripsState, (s) => s.mutating);

export const selectUpcomingTrips = createSelector(selectAllTrips, (trips) =>
  trips.filter((t) => t.status === 'upcoming')
);

export const selectTripsByStatus = (status: string) =>
  createSelector(selectAllTrips, (trips) => trips.filter((t) => t.status === status));
