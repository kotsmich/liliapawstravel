import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { TripRequest, Dog } from '@myorg/models';

export const TripRequestActions = createActionGroup({
  source: 'TripRequest',
  events: {
    'Submit Request': props<{ dogs: Dog[] }>(),
    'Submit Request Success': props<{ request: TripRequest }>(),
    'Submit Request Failure': props<{ error: string }>(),
    'Reset Request': emptyProps(),
  },
});
