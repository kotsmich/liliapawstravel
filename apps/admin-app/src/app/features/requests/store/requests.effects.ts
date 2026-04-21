import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, EMPTY, filter, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';
import { extractError } from '@admin/shared/utils/extract-error';
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
  addRequestFromSocket, requestUpdatedFromSocket,
  setSelectedTripId, autoSelectNearestTripId,
} from './requests.actions';
import { selectSelectedTripId } from './requests.selectors';
import { deleteTripSuccess, loadTripByIdSuccess, loadTrips, loadTripsSuccess, selectAllTrips } from '@admin/features/trips/store';

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
          catchError((error) => of(loadRequestsFailure({ error: extractError(error) })))
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
          catchError((error) => of(approveRequestFailure({ error: extractError(error) })))
        )
      )
    )
  );

  rejectRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(rejectRequest),
      switchMap(({ id }) =>
        this.requestsService.updateRequestStatus(id, 'rejected').pipe(
          map((request) => rejectRequestSuccess({ request })),
          catchError((error) => of(rejectRequestFailure({ error: extractError(error) })))
        )
      )
    )
  );

  deleteRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteRequest),
      switchMap(({ requestId }) =>
        this.requestsService.deleteRequest(requestId).pipe(
          map(() => deleteRequestSuccess({ requestId })),
          catchError((error) => of(deleteRequestFailure({ error: extractError(error) })))
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
          catchError((error) => of(bulkApproveRequestsFailure({ error: extractError(error) })))
        )
      )
    )
  );

  bulkRejectRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(bulkRejectRequests),
      switchMap(({ ids }) =>
        this.requestsService.bulkRejectRequests(ids).pipe(
          map((result) => bulkRejectRequestsSuccess(result)),
          catchError((error) => of(bulkRejectRequestsFailure({ error: extractError(error) })))
        )
      )
    )
  );

  reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        approveRequestSuccess,
        rejectRequestSuccess,
        bulkApproveRequestsSuccess,
        bulkRejectRequestsSuccess,
        deleteTripSuccess,
      ),
      mergeMap((action) =>
        action.type === bulkApproveRequestsSuccess.type
          ? [loadRequests(), loadTrips()]
          : [loadRequests()]
      )
    )
  );

  triggerAutoSelectTripId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTripsSuccess),
      withLatestFrom(this.store.select(selectSelectedTripId)),
      filter(([, current]) => current === null),
      map(() => autoSelectNearestTripId())
    )
  );

  autoSelectTripId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(autoSelectNearestTripId),
      withLatestFrom(this.store.select(selectAllTrips)),
      map(([, trips]) => {
        const nearest = [...trips]
          .filter((trip) => trip.status === 'upcoming')
          .sort((a, b) => a.date.localeCompare(b.date))[0];
        return setSelectedTripId({ tripId: nearest?.id ?? null });
      })
    )
  );

  enrichRequestFromSocket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addRequestFromSocket),
      switchMap(({ request }) =>
        this.requestsService.getRequestById(request.id).pipe(
          map((full) => requestUpdatedFromSocket({ request: full })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  updateRequestNote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateRequestNote),
      switchMap(({ id, note }) =>
        this.requestsService.updateRequestNote(id, note).pipe(
          map((request) => updateRequestNoteSuccess({ request })),
          catchError((error) => of(updateRequestNoteFailure({ error: extractError(error) })))
        )
      )
    )
  );
}
