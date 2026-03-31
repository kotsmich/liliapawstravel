import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { TripRequestService } from '@user/services/trip-request.service';
import { submitRequest, submitRequestSuccess, submitRequestFailure } from './trip-request.actions';

@Injectable()
export class TripRequestEffects {
  submitRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(submitRequest),
      switchMap(({ dogs, tripId, requesterName, requesterEmail, requesterPhone }) =>
        this.tripRequestService.submitRequest({ dogs, tripId, requesterName, requesterEmail, requesterPhone }).pipe(
          map((request) => submitRequestSuccess({ request })),
          catchError((error) => {
            const message =
              error.status === 409
                ? error.error?.message ?? 'This trip has no remaining capacity.'
                : error.message ?? 'Something went wrong.';
            return of(submitRequestFailure({ error: message }));
          })
        )
      )
    )
  );

  constructor(private actions$: Actions, private tripRequestService: TripRequestService) {}
}
