import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { TripRequestService } from '@myorg/api';
import { TripRequestActions } from './trip-request.actions';

@Injectable()
export class TripRequestEffects {
  submitRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripRequestActions.submitRequest),
      switchMap(({ dogs }) =>
        this.tripRequestService.submitRequest(dogs).pipe(
          map((request) => TripRequestActions.submitRequestSuccess({ request })),
          catchError((error) => of(TripRequestActions.submitRequestFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private tripRequestService: TripRequestService) {}
}
