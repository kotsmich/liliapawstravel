import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { TripRequestService } from '../../core/services/trip-request.service';
import { TripRequestActions } from './trip-request.actions';

@Injectable()
export class TripRequestEffects {
  submitTripRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripRequestActions.submitTripRequest),
      switchMap(({ request }) =>
        this.tripRequestService.submitRequest(request).pipe(
          map((submission) =>
            TripRequestActions.submitTripRequestSuccess({ submission })
          ),
          catchError((error) =>
            of(TripRequestActions.submitTripRequestFailure({ error: error.message }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private tripRequestService: TripRequestService
  ) {}
}
