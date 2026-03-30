import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { RequestsService } from '@admin/services/requests.service';
import { TripRequestActions } from './requests.actions';
import { TripActions } from '@admin/store/trips';

@Injectable()
export class RequestsEffects {
  loadRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripRequestActions.loadRequests),
      switchMap(() =>
        this.requestsService.getRequests().pipe(
          map((requests) => TripRequestActions.loadRequestsSuccess({ requests })),
          catchError((error) => of(TripRequestActions.loadRequestsFailure({ error: error.message })))
        )
      )
    )
  );

  approveRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripRequestActions.approveRequest),
      switchMap(({ requestId }) =>
        this.requestsService.updateRequestStatus(requestId, 'approved').pipe(
          mergeMap((request) => [
            TripRequestActions.approveRequestSuccess({ request }),
            TripActions.loadTrips(),
          ]),
          catchError((error) => of(TripRequestActions.approveRequestFailure({ error: error.message })))
        )
      )
    )
  );

  reloadAfterApprove$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripRequestActions.approveRequestSuccess),
      map(() => TripRequestActions.loadRequests())
    )
  );

  updateRequestStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripRequestActions.updateRequestStatus),
      switchMap(({ id, status }) =>
        this.requestsService.updateRequestStatus(id, status as 'approved' | 'rejected').pipe(
          map((request) => TripRequestActions.updateRequestStatusSuccess({ request })),
          catchError((error) => of(TripRequestActions.updateRequestStatusFailure({ error: error.message })))
        )
      )
    )
  );

  reloadAfterReject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripRequestActions.updateRequestStatusSuccess),
      map(() => TripRequestActions.loadRequests())
    )
  );

  deleteRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripRequestActions.deleteRequest),
      switchMap(({ requestId }) =>
        this.requestsService.deleteRequest(requestId).pipe(
          map(() => TripRequestActions.deleteRequestSuccess({ requestId })),
          catchError((error) => of(TripRequestActions.deleteRequestFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private requestsService: RequestsService) {}
}
