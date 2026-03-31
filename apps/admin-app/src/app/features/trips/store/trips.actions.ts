import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Trip } from '@models/lib/trip.model';
import { Dog } from '@models/lib/dog.model';

export const TripActions = createActionGroup({
  source: 'Trips',
  events: {
    'Load Trips': emptyProps(),
    'Load Trips Success': props<{ trips: Trip[] }>(),
    'Load Trips Failure': props<{ error: string }>(),
    'Select Trip': props<{ id: string }>(),
    'Clear Selected Trip': emptyProps(),
    'Add Trip': props<{ trip: Omit<Trip, 'id'> }>(),
    'Add Trip Success': props<{ trip: Trip }>(),
    'Add Trip Failure': props<{ error: string }>(),
    'Update Trip': props<{ id: string; trip: Partial<Trip> }>(),
    'Update Trip Success': props<{ trip: Trip }>(),
    'Update Trip Failure': props<{ error: string }>(),
    'Delete Trip': props<{ id: string }>(),
    'Delete Trip Success': props<{ id: string }>(),
    'Delete Trip Failure': props<{ error: string }>(),
    'Load Trip By Id': props<{ id: string }>(),
    'Load Trip By Id Success': props<{ trip: Trip }>(),
    'Load Trip By Id Failure': props<{ error: string }>(),
    'Update Dog': props<{ tripId: string; dog: Dog }>(),
    'Update Dog Success': props<{ tripId: string; dog: Dog }>(),
    'Update Dog Failure': props<{ error: string }>(),
  },
});
