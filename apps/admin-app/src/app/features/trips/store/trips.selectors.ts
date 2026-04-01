import { createSelector, MemoizedSelector } from '@ngrx/store';
import { CalendarEvent } from '@models/lib/calendar-event.model';
import { Trip } from '@models/lib/trip.model';
import { selectCalendarSelectedDate } from '@admin/core/store/calendar';
import { selectTripsState } from './trips.reducer';

export const selectAllTrips = createSelector(selectTripsState, (s) => s.trips);
export const selectTripsIsLoading = createSelector(selectTripsState, (s) => s.loading);
export const selectTripsIsMutating = createSelector(selectTripsState, (s) => s.mutating);

export const selectTripsForSelectedDate = createSelector(
  selectAllTrips,
  selectCalendarSelectedDate,
  (trips, date) => (date ? trips.filter((t) => t.date === date) : [])
);

const _tripByIdCache = new Map<string, MemoizedSelector<object, Trip | null>>();

export const selectTripById = (id: string): MemoizedSelector<object, Trip | null> => {
  if (!_tripByIdCache.has(id)) {
    _tripByIdCache.set(
      id,
      createSelector(selectAllTrips, (trips) => trips.find((t) => t.id === id) ?? null)
    );
  }
  return _tripByIdCache.get(id)!;
};

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
            : t.spotsAvailable <= 2
              ? '#f59e0b'
              : '#4caf50',
      dogsCount: t.dogs?.length ?? 0,
      totalCapacity: t.totalCapacity,
      spotsAvailable: t.spotsAvailable,
      isFull: t.isFull,
      acceptingRequests: t.acceptingRequests,
    }))
);
