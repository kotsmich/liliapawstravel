import { createAction, props } from '@ngrx/store';
import { TripRequest } from '@models/lib/trip-request.model';

export interface DogFiles {
  photo: File | null;
  document: File | null;
}

export const submitRequest = createAction(
  '[TripRequest] Submit Request',
  props<{
    dogs: Record<string, unknown>[];
    dogFiles: DogFiles[];
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
