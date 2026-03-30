import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Trip } from '@models/lib/trip.model';

export const TripActions = createActionGroup({
  source: 'Trips',
  events: {
    'Refresh Trips': emptyProps(),
    'Load Trips Success': props<{ trips: Trip[] }>(),
    'Load Trips Failure': props<{ error: string }>(),
    'Clear Selected Trip': emptyProps(),
  },
});
