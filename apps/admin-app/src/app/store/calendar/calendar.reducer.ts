import { createFeature, createReducer, on } from '@ngrx/store';
import { CalendarActions } from './calendar.actions';

export interface CalendarState {
  selectedDate: string | null;
}

const initialState: CalendarState = {
  selectedDate: null,
};

export const calendarFeature = createFeature({
  name: 'calendar',
  reducer: createReducer(
    initialState,
    on(CalendarActions.selectDate, (s, { date }) => ({ ...s, selectedDate: date })),
    on(CalendarActions.clearDate, (s) => ({ ...s, selectedDate: null }))
  ),
});

export const {
  name: calendarFeatureName,
  reducer: calendarReducer,
  selectCalendarState,
  selectSelectedDate,
} = calendarFeature;
