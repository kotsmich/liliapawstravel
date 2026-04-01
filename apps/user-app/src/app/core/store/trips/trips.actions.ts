import { createAction, props } from '@ngrx/store';
import { Trip } from '@models/lib/trip.model';

export const refreshTrips = createAction('[Trips] Refresh Trips');
export const loadTripsSuccess = createAction(
  '[Trips] Load Trips Success',
  props<{ trips: Trip[] }>()
);

export const loadTripsFailure = createAction(
  '[Trips] Load Trips Failure',
  props<{ error: string }>()
);

export const clearSelectedTrip = createAction(
    '[Trips] Clear Selected Trip'
);

export const wsTripsReceived = createAction(
  '[Trips] Ws Trips Received',
  props<{ trips: Trip[] }>()
);
