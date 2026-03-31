import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const CalendarActions = createActionGroup({
  source: 'Calendar',
  events: {
    'Select Date': props<{ date: string }>(),
    'Clear Date': emptyProps(),
  },
});
