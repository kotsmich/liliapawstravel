import { createAction, props } from '@ngrx/store';
import { Trip } from '@models/lib/trip.model';
import { Dog } from '@models/lib/dog.model';

export const loadTrips = createAction('[Trips] Load Trips');
export const loadTripsSuccess = createAction(
  '[Trips] Load Trips Success',
  props<{ trips: Trip[] }>()
);
export const loadTripsFailure = createAction(
  '[Trips] Load Trips Failure',
  props<{ error: string }>()
);

export const selectTrip = createAction(
  '[Trips] Select Trip',
  props<{ id: string }>()
);
export const clearSelectedTrip = createAction('[Trips] Clear Selected Trip');

export const addTrip = createAction(
  '[Trips] Add Trip',
  props<{ trip: Omit<Trip, 'id'> }>()
);

export const addTripSuccess = createAction(
  '[Trips] Add Trip Success',
  props<{ trip: Trip }>()
);

export const addTripFailure = createAction(
  '[Trips] Add Trip Failure',
  props<{ error: string }>()
);

export const updateTrip = createAction(
  '[Trips] Update Trip',
  props<{ id: string; trip: Partial<Trip> }>()
);

export const updateTripSuccess = createAction(
  '[Trips] Update Trip Success',
  props<{ trip: Trip }>()
);

export const updateTripFailure = createAction(
  '[Trips] Update Trip Failure',
  props<{ error: string }>()
);

export const deleteTrip = createAction(
  '[Trips] Delete Trip',
  props<{ id: string }>()
);

export const deleteTripSuccess = createAction(
  '[Trips] Delete Trip Success',
  props<{ id: string }>()
);

export const deleteTripFailure = createAction(
  '[Trips] Delete Trip Failure',
  props<{ error: string }>()
);

export const loadTripById = createAction(
  '[Trips] Load Trip By Id',
  props<{ id: string }>()
);

export const loadTripByIdSuccess = createAction(
  '[Trips] Load Trip By Id Success',
  props<{ trip: Trip }>()
);

export const loadTripByIdFailure = createAction(
  '[Trips] Load Trip By Id Failure',
  props<{ error: string }>()
);

export const addDog = createAction(
  '[Trips] Add Dog',
  props<{ tripId: string; dog: Omit<Dog, 'id'> }>()
);

export const addDogSuccess = createAction(
  '[Trips] Add Dog Success',
  props<{ tripId: string; dog: Dog }>()
);

export const addDogFailure = createAction(
  '[Trips] Add Dog Failure',
  props<{ error: string }>()
);

export const updateDog = createAction(
  '[Trips] Update Dog',
  props<{ tripId: string; dog: Dog }>()
);

export const updateDogSuccess = createAction(
  '[Trips] Update Dog Success',
  props<{ tripId: string; dog: Dog }>()
);

export const updateDogFailure = createAction(
  '[Trips] Update Dog Failure',
  props<{ error: string }>()
);
