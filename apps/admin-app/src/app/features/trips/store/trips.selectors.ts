import { createSelector, MemoizedSelector } from '@ngrx/store';
import { CalendarEvent } from '@models/lib/calendar-event.model';
import { Trip } from '@models/lib/trip.model';
import { selectCalendarSelectedDate } from '@admin/core/store/calendar';
import { adapter, selectTripsState } from './trips.reducer';

const { selectAll: selectAllTrips, selectEntities: selectTripEntities } = adapter.getSelectors(selectTripsState);

export { selectAllTrips };

export const selectSelectedTripId = createSelector(selectTripsState, (state) => state.selectedTripId);
export const selectSelectedTrip = createSelector(
  selectTripEntities, selectSelectedTripId,
  (entities, id) => (id ? entities[id] ?? null : null)
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
      createSelector(selectTripEntities, (entities) => entities[id] ?? null)
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
