import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CalendarEvent } from '../../models';

export const CalendarActions = createActionGroup({
  source: 'Calendar',
  events: {
    'Load Events': emptyProps(),
    'Load Events Success': props<{ events: CalendarEvent[] }>(),
    'Load Events Failure': props<{ error: string }>(),
    'Select Date': props<{ date: string }>(),
  },
});
