import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { TripRequest } from '@models/lib/trip-request.model';
import { Dog } from '@models/lib/dog.model';

export const TripRequestActions = createActionGroup({
  source: 'TripRequest',
  events: {
    'Submit Request': props<{
      dogs: Dog[];
      tripId?: string;
      requesterName: string;
      requesterEmail: string;
      requesterPhone: string;
    }>(),
    'Submit Request Success': props<{ request: TripRequest }>(),
    'Submit Request Failure': props<{ error: string }>(),
    'Reset Request': emptyProps(),
  },
});
