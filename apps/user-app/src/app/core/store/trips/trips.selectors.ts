import { createSelector } from '@ngrx/store';
import { CalendarEvent } from '@models/lib/calendar-event.model';
import { selectAllTrips } from './trips.reducer';

export const selectTripsAsCalendarEvents = createSelector(selectAllTrips, (trips): CalendarEvent[] =>
  trips
    .filter((trip) => trip.status !== 'completed')
    .map((trip) => ({
      id: `evt-${trip.id}`,
      tripId: trip.id,
      title: `${trip.departureCity} → ${trip.arrivalCity}`,
      date: trip.date,
      color:
        trip.isFull || trip.spotsAvailable <= 0 || !trip.acceptingRequests
          ? '#94a3b8'
          : trip.status === 'in-progress'
            ? '#e07b54'
            : '#4caf50',
      dogsCount: trip.totalCapacity - trip.spotsAvailable,
      totalCapacity: trip.totalCapacity,
      spotsAvailable: trip.spotsAvailable,
      isFull: trip.isFull,
      acceptingRequests: trip.acceptingRequests,
    }))
);
