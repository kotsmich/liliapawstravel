import { createFeature, createReducer, on } from '@ngrx/store';
import { CalendarEvent } from '@myorg/models';
import { CalendarActions } from './calendar.actions';

export interface CalendarState {
  events: CalendarEvent[];
  selectedDate: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: CalendarState = {
  events: [],
  selectedDate: null,
  loading: false,
  error: null,
};

export const calendarFeature = createFeature({
  name: 'calendar',
  reducer: createReducer(
    initialState,
    on(CalendarActions.loadEvents, (s) => ({ ...s, loading: true, error: null })),
    on(CalendarActions.loadEventsSuccess, (s, { events }) => ({ ...s, events, loading: false })),
    on(CalendarActions.loadEventsFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(CalendarActions.selectDate, (s, { date }) => ({ ...s, selectedDate: date })),
    on(CalendarActions.clearDate, (s) => ({ ...s, selectedDate: null }))
  ),
});

export const {
  name: calendarFeatureName,
  reducer: calendarReducer,
  selectCalendarState,
  selectEvents,
  selectSelectedDate,
  selectLoading: selectCalendarLoading,
  selectError: selectCalendarError,
} = calendarFeature;
