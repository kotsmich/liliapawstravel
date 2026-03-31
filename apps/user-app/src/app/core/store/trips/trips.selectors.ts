import { createSelector } from '@ngrx/store';
import { CalendarEvent } from '@models/lib/calendar-event.model';
import { selectTripsState } from './trips.reducer';

export const selectAllTrips = createSelector(selectTripsState, (s) => s.trips);
export const selectTripsIsLoading = createSelector(selectTripsState, (s) => s.loading);

export const selectTripsAsCalendarEvents = createSelector(selectAllTrips, (trips): CalendarEvent[] =>
  trips
    .filter((t) => t.status !== 'completed')
    .map((t) => ({
      id: `evt-${t.id}`,
      tripId: t.id,
      title: `${t.departureCity} → ${t.arrivalCity}`,
      date: t.date,
      color:
        t.isFull || t.spotsAvailable <= 0 || !t.acceptingRequests
          ? '#94a3b8'
          : t.status === 'in-progress'
            ? '#e07b54'
            : '#4caf50',
      dogsCount: t.dogs?.length ?? 0,
      totalCapacity: t.totalCapacity,
      isFull: t.isFull,
      acceptingRequests: t.acceptingRequests,
    }))
);
