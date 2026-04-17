import { createSelector, MemoizedSelector } from '@ngrx/store';
import { CalendarEvent } from '@models/lib/calendar-event.model';
import { Trip } from '@models/lib/trip.model';
import { selectCalendarSelectedDate } from '@admin/core/store/calendar';
import { selectTripsState } from './trips.reducer';

export const selectAllTrips = createSelector(selectTripsState, (state) => state.trips);
export const selectSelectedTripId = createSelector(selectTripsState, (state) => state.selectedTripId);
export const selectSelectedTrip = createSelector(
  selectAllTrips, selectSelectedTripId,
  (trips, id) => trips.find((trip) => trip.id === id) ?? null
);
export const selectTripsIsLoading = createSelector(selectTripsState, (state) => state.loading);
export const selectTripsIsMutating = createSelector(selectTripsState, (state) => state.mutating);

export const selectTripsForSelectedDate = createSelector(
  selectAllTrips,
  selectCalendarSelectedDate,
  (trips, date) => (date ? trips.filter((trip) => trip.date === date) : [])
);

const _tripByIdCache = new Map<string, MemoizedSelector<object, Trip | null>>();

export const selectTripById = (id: string): MemoizedSelector<object, Trip | null> => {
  if (!_tripByIdCache.has(id)) {
    _tripByIdCache.set(
      id,
      createSelector(selectAllTrips, (trips) => trips.find((trip) => trip.id === id) ?? null)
    );
  }
  return _tripByIdCache.get(id)!;
};

export const clearSelectTripByIdCache = (): void => _tripByIdCache.clear();

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
            : trip.spotsAvailable <= 2
              ? '#f59e0b'
              : '#4caf50',
      dogsCount: trip.dogs?.length ?? 0,
      totalCapacity: trip.totalCapacity,
      spotsAvailable: trip.spotsAvailable,
      isFull: trip.isFull,
      acceptingRequests: trip.acceptingRequests,
    }))
);
