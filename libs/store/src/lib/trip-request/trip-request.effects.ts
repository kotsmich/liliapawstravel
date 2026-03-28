import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, mergeMap } from 'rxjs';
import { TripRequestService } from '@myorg/api';
import { TripRequestActions } from './trip-request.actions';
import { TripActions } from '../trips/trips.actions';

@Injectable()
export class TripRequestEffects {
  submitRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripRequestActions.submitRequest),
      switchMap(({ dogs, tripId, requesterName, requesterEmail, requesterPhone }) =>
        this.tripRequestService.submitRequest(dogs, tripId, requesterName, requesterEmail, requesterPhone).pipe(
          map((request) => TripRequestActions.submitRequestSuccess({ request })),
          catchError((error) => {
            const message =
              error.status === 409
                ? error.error?.message ?? 'This trip has no remaining capacity.'
                : error.message ?? 'Something went wrong.';
            return of(TripRequestActions.submitRequestFailure({ error: message }));
          })
        )
      )
    )
  );

  loadRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripRequestActions.loadRequests),
      switchMap(() =>
        this.tripRequestService.getRequests().pipe(
          map((requests) => TripRequestActions.loadRequestsSuccess({ requests })),
          catchError((error) => of(TripRequestActions.loadRequestsFailure({ error: error.message })))
        )
      )
    )
  );

  approveRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripRequestActions.approveRequest),
      switchMap(({ requestId, tripId }) =>
        this.tripRequestService.updateStatus(requestId, 'confirmed').pipe(
          mergeMap((request) => [
            TripRequestActions.approveRequestSuccess({ request }),
            TripActions.loadTripById({ id: tripId }),
          ]),
          catchError((error) => of(TripRequestActions.approveRequestFailure({ error: error.message })))
        )
      )
    )
  );

  updateRequestStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripRequestActions.updateRequestStatus),
      switchMap(({ id, status }) =>
        this.tripRequestService.updateStatus(id, status).pipe(
          map((request) => TripRequestActions.updateRequestStatusSuccess({ request })),
          catchError((error) => of(TripRequestActions.updateRequestStatusFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private tripRequestService: TripRequestService) {}
}
