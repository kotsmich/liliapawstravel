import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { TripRequest, TripRequestSubmission } from '../../models';

export const TripRequestActions = createActionGroup({
  source: 'TripRequest',
  events: {
    'Submit Trip Request': props<{ request: TripRequest }>(),
    'Submit Trip Request Success': props<{ submission: TripRequestSubmission }>(),
    'Submit Trip Request Failure': props<{ error: string }>(),
    'Reset Trip Request': emptyProps(),
  },
});
