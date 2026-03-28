import { createSelector } from '@ngrx/store';
import { selectCalendarState } from './calendar.reducer';

export const selectAllEvents = createSelector(
  selectCalendarState,
  (state) => state.events
);

export const selectCalendarSelectedDate = createSelector(
  selectCalendarState,
  (state) => state.selectedDate
);

export const selectCalendarIsLoading = createSelector(
  selectCalendarState,
  (state) => state.loading
);

export const selectCalendarHasError = createSelector(
  selectCalendarState,
  (state) => state.error
);

export const selectEventsForSelectedDate = createSelector(
  selectAllEvents,
  selectCalendarSelectedDate,
  (events, selectedDate) =>
    selectedDate
      ? events.filter((e) => e.date === selectedDate)
      : events
);
