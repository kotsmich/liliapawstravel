import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { RequestsService } from '@admin/services/requests.service';
import {
  loadRequests, loadRequestsSuccess, loadRequestsFailure,
  approveRequest, approveRequestSuccess, approveRequestFailure,
  rejectRequest, rejectRequestSuccess, rejectRequestFailure,
  deleteRequest, deleteRequestSuccess, deleteRequestFailure,
  bulkApproveRequests, bulkApproveRequestsSuccess, bulkApproveRequestsFailure,
  bulkRejectRequests, bulkRejectRequestsSuccess, bulkRejectRequestsFailure,
  updateRequestNote, updateRequestNoteSuccess, updateRequestNoteFailure,
  setSelectedTripId,
} from './requests.actions';
import { selectSelectedTripId } from './requests.selectors';
import { deleteTripSuccess, loadTripByIdSuccess, loadTrips, loadTripsSuccess } from '@admin/features/trips/store';

@Injectable()
export class RequestsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
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

  autoSelectTripId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTripsSuccess),
      withLatestFrom(this.store.select(selectSelectedTripId)),
      filter(([, current]) => current === null),
      map(([{ trips }]) => {
        const nearest = [...trips]
          .filter((t) => t.status === 'upcoming')
          .sort((a, b) => a.date.localeCompare(b.date))[0];
        return setSelectedTripId({ tripId: nearest?.id ?? null });
      })
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
