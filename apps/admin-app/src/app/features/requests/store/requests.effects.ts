import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { RequestsService } from '@admin/services/requests.service';
import {
  loadRequests, loadRequestsSuccess, loadRequestsFailure,
  approveRequest, approveRequestSuccess, approveRequestFailure,
  updateRequestStatus, updateRequestStatusSuccess, updateRequestStatusFailure,
  deleteRequest, deleteRequestSuccess, deleteRequestFailure,
} from './requests.actions';
import { loadTripByIdSuccess } from '@admin/features/trips/store';

@Injectable()
export class RequestsEffects {
  loadRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadRequests),
      switchMap(() =>
        this.requestsService.getRequests().pipe(
          map((requests) => loadRequestsSuccess({ requests })),
          catchError((error) => of(loadRequestsFailure({ error: error.message })))
        )
      )
    )
  );

  approveRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(approveRequest),
      switchMap(({ requestId }) =>
        this.requestsService.approveRequest(requestId).pipe(
          mergeMap(({ request, trip }) => [
            approveRequestSuccess({ request }),
            loadTripByIdSuccess({ trip }),
          ]),
          catchError((error) => of(approveRequestFailure({ error: error.message })))
        )
      )
    )
  );

  reloadAfterApprove$ = createEffect(() =>
    this.actions$.pipe(
      ofType(approveRequestSuccess),
      map(() => loadRequests())
    )
  );

  updateRequestStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateRequestStatus),
      switchMap(({ id, status }) =>
        this.requestsService.updateRequestStatus(id, status as 'rejected').pipe(
          map((request) => updateRequestStatusSuccess({ request })),
          catchError((error) => of(updateRequestStatusFailure({ error: error.message })))
        )
      )
    )
  );

  reloadAfterReject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateRequestStatusSuccess),
      map(() => loadRequests())
    )
  );

  deleteRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteRequest),
      switchMap(({ requestId }) =>
        this.requestsService.deleteRequest(requestId).pipe(
          map(() => deleteRequestSuccess({ requestId })),
          catchError((error) => of(deleteRequestFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private requestsService: RequestsService) {}
}
