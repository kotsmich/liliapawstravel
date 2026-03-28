import { createFeature, createReducer, on } from '@ngrx/store';
import { CalendarEvent } from '../../models';
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
    on(CalendarActions.loadEvents, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(CalendarActions.loadEventsSuccess, (state, { events }) => ({
      ...state,
      events,
      loading: false,
    })),
    on(CalendarActions.loadEventsFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),
    on(CalendarActions.selectDate, (state, { date }) => ({
      ...state,
      selectedDate: date,
    }))
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
