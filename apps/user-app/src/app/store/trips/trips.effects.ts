import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { TripsService } from '@user/services/trips.service';
import { TripActions } from './trips.actions';

@Injectable()
export class TripsEffects {
  refreshTrips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripActions.refreshTrips),
      switchMap(() =>
        this.tripsService.getTrips().pipe(
          map((trips) => TripActions.loadTripsSuccess({ trips })),
          catchError((error) => of(TripActions.loadTripsFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private tripsService: TripsService) {}
}
