import { createFeature, createReducer, on } from '@ngrx/store';
import { selectDate, clearDate } from './calendar.actions';

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
    on(selectDate, (s, { date }) => ({ ...s, selectedDate: date })),
    on(clearDate, (state) => ({ ...state, selectedDate: null }))
  ),
});

export const {
  name: calendarFeatureName,
  reducer: calendarReducer,
  selectCalendarState,
  selectSelectedDate,
} = calendarFeature;
