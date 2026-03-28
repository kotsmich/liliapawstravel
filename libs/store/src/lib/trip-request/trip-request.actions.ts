import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { TripRequest, Dog } from '@myorg/models';

export const TripRequestActions = createActionGroup({
  source: 'TripRequest',
  events: {
    'Submit Request': props<{ dogs: Dog[]; tripId?: string; requesterName: string; requesterEmail: string; requesterPhone: string }>(),
    'Submit Request Success': props<{ request: TripRequest }>(),
    'Submit Request Failure': props<{ error: string }>(),
    'Reset Request': emptyProps(),
    'Load Requests': emptyProps(),
    'Load Requests Success': props<{ requests: TripRequest[] }>(),
    'Load Requests Failure': props<{ error: string }>(),
    'Approve Request': props<{ requestId: string; tripId: string }>(),
    'Approve Request Success': props<{ request: TripRequest }>(),
    'Approve Request Failure': props<{ error: string }>(),
    'Update Request Status': props<{ id: string; status: TripRequest['status'] }>(),
    'Update Request Status Success': props<{ request: TripRequest }>(),
    'Update Request Status Failure': props<{ error: string }>(),
  },
});
