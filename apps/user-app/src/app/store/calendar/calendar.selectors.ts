import { createSelector } from '@ngrx/store';
import { selectCalendarState } from './calendar.reducer';
import { selectAllTrips } from '@user/store/trips';

export const selectCalendarSelectedDate = createSelector(selectCalendarState, (s) => s.selectedDate);

export const selectTripForSelectedDate = createSelector(
  selectAllTrips,
  selectCalendarSelectedDate,
  (trips, date) => (date ? (trips.find((t) => t.date === date) ?? null) : null)
);
