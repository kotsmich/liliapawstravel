import { createSelector } from '@ngrx/store';
import { selectCalendarState } from './calendar.reducer';

export const selectAllEvents = createSelector(selectCalendarState, (s) => s.events);
export const selectCalendarSelectedDate = createSelector(selectCalendarState, (s) => s.selectedDate);
export const selectCalendarIsLoading = createSelector(selectCalendarState, (s) => s.loading);
export const selectCalendarHasError = createSelector(selectCalendarState, (s) => s.error);

export const selectEventsForDate = createSelector(
  selectAllEvents,
  selectCalendarSelectedDate,
  (events, date) => (date ? events.filter((e) => e.date === date) : events)
);
