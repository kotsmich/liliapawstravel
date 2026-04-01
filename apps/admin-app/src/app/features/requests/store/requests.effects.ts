import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { RequestsService } from '@admin/services/requests.service';
import {
  loadRequests, loadRequestsSuccess, loadRequestsFailure,
  approveRequest, approveRequestSuccess, approveRequestFailure,
  rejectRequest, rejectRequestSuccess, rejectRequestFailure,
  deleteRequest, deleteRequestSuccess, deleteRequestFailure,
  bulkApproveRequests, bulkApproveRequestsSuccess, bulkApproveRequestsFailure,
  bulkRejectRequests, bulkRejectRequestsSuccess, bulkRejectRequestsFailure,
  updateRequestNote, updateRequestNoteSuccess, updateRequestNoteFailure,
} from './requests.actions';
import { deleteTripSuccess, loadTripByIdSuccess, loadTrips } from '@admin/features/trips/store';

@Injectable()
export class RequestsEffects {
  private readonly actions$ = inject(Actions);
  private readonly requestsService = inject(RequestsService);

  loadRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadRequests),
      switchMap(() =>
        this.requestsService.getRequests().pipe(
          map((requests) => loadRequestsSuccess({ requests })),
          catchError((error) => of(loadRequestsFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
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
          catchError((error) => of(approveRequestFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
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

  rejectRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(rejectRequest),
      switchMap(({ id }) =>
        this.requestsService.updateRequestStatus(id, 'rejected').pipe(
          map((request) => rejectRequestSuccess({ request })),
          catchError((error) => of(rejectRequestFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  reloadAfterReject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(rejectRequestSuccess),
      map(() => loadRequests())
    )
  );

  deleteRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteRequest),
      switchMap(({ requestId }) =>
        this.requestsService.deleteRequest(requestId).pipe(
          map(() => deleteRequestSuccess({ requestId })),
          catchError((error) => of(deleteRequestFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  bulkApproveRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(bulkApproveRequests),
      switchMap(({ ids }) =>
        this.requestsService.bulkApproveRequests(ids).pipe(
          map((result) => bulkApproveRequestsSuccess(result)),
          catchError((error) => of(bulkApproveRequestsFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  reloadAfterBulkApprove$ = createEffect(() =>
    this.actions$.pipe(
      ofType(bulkApproveRequestsSuccess),
      mergeMap(() => [loadRequests(), loadTrips()])
    )
  );

  bulkRejectRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(bulkRejectRequests),
      switchMap(({ ids }) =>
        this.requestsService.bulkRejectRequests(ids).pipe(
          map((result) => bulkRejectRequestsSuccess(result)),
          catchError((error) => of(bulkRejectRequestsFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  reloadAfterBulkReject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(bulkRejectRequestsSuccess),
      map(() => loadRequests())
    )
  );

  reloadAfterDeleteTrip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteTripSuccess),
      map(() => loadRequests())
    )
  );

  updateRequestNote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateRequestNote),
      switchMap(({ id, note }) =>
        this.requestsService.updateRequestNote(id, note).pipe(
          map((request) => updateRequestNoteSuccess({ request })),
          catchError((error) => of(updateRequestNoteFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );
}
