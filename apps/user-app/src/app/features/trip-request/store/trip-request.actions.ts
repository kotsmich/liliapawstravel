import { createAction, props } from '@ngrx/store';
import { TripRequest } from '@models/lib/trip-request.model';
import { Dog } from '@models/lib/dog.model';

export const submitRequest = createAction(
  '[TripRequest] Submit Request',
  props<{
    dogs: Dog[];
    tripId?: string;
    requesterName: string;
    requesterEmail: string;
    requesterPhone: string;
  }>()
);

export const submitRequestSuccess = createAction(
  '[TripRequest] Submit Request Success',
  props<{ request: TripRequest }>()
);

export const submitRequestFailure = createAction(
  '[TripRequest] Submit Request Failure',
  props<{ error: string }>()
);

export const resetRequest = createAction('[TripRequest] Reset Request');
