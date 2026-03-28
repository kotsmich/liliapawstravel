import { createSelector } from '@ngrx/store';
import { CalendarEvent } from '@myorg/models';
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

// Mirrors the server-side /api/calendar logic so the admin calendar updates instantly on trip edits.
export const selectTripsAsCalendarEvents = createSelector(selectAllTrips, (trips): CalendarEvent[] =>
  trips
    .filter((t) => t.status !== 'completed')
    .map((t) => ({
      id: `evt-${t.id}`,
      tripId: t.id,
      title: `${t.departureCity} → ${t.arrivalCity}`,
      date: t.date,
      color: t.status === 'in-progress' ? '#e07b54' : '#4caf50',
    }))
);

