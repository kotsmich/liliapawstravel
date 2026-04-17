import { createSelector } from '@ngrx/store';
import { selectCalendarState } from './calendar.reducer';

export const selectCalendarSelectedDate = createSelector(selectCalendarState, (state) => state.selectedDate);
