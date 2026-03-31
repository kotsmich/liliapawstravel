import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { TripsService } from '@user/services/trips.service';
import { TripsWebSocketService } from '@user/services/trips-websocket.service';
import { refreshTrips, loadTripsSuccess, loadTripsFailure, wsTripsReceived } from './trips.actions';

@Injectable()
export class TripsEffects {
  private readonly wsService = inject(TripsWebSocketService);

  refreshTrips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(refreshTrips),
      switchMap(() =>
        this.tripsService.getTrips().pipe(
          map((trips) => loadTripsSuccess({ trips })),
          catchError((error) => of(loadTripsFailure({ error: error.message })))
        )
      )
    )
  );

  wsTrips$ = createEffect(() =>
    this.wsService.connect().pipe(
      map((trips) => wsTripsReceived({ trips }))
    )
  );

  constructor(private actions$: Actions, private tripsService: TripsService) {}
}
