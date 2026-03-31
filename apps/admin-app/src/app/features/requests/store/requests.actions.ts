import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { TripRequest } from '@models/lib/trip-request.model';

export const TripRequestActions = createActionGroup({
  source: 'TripRequest',
  events: {
    'Load Requests': emptyProps(),
    'Load Requests Success': props<{ requests: TripRequest[] }>(),
    'Load Requests Failure': props<{ error: string }>(),
    'Approve Request': props<{ requestId: string; tripId: string }>(),
    'Approve Request Success': props<{ request: TripRequest }>(),
    'Approve Request Failure': props<{ error: string }>(),
    'Update Request Status': props<{ id: string; status: TripRequest['status'] }>(),
    'Update Request Status Success': props<{ request: TripRequest }>(),
    'Update Request Status Failure': props<{ error: string }>(),
    'Delete Request': props<{ requestId: string }>(),
    'Delete Request Success': props<{ requestId: string }>(),
    'Delete Request Failure': props<{ error: string }>(),
    'Add Request From Socket': props<{ request: TripRequest }>(),
  },
});
