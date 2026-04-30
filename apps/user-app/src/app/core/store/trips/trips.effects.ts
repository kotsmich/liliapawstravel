import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Actions, OnInitEffects, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { EMPTY, catchError, map, of, retry, switchMap } from 'rxjs';

import { TripsService } from '@user/services/trips.service';
import { TripsWebSocketService } from '@user/services/trips-websocket.service';
import { refreshTrips, loadTripsSuccess, loadTripsFailure, wsTripsReceived } from './trips.actions';

@Injectable()
export class TripsEffects implements OnInitEffects {
  private readonly actions$ = inject(Actions);
  private readonly tripsService = inject(TripsService);
  private readonly wsService = inject(TripsWebSocketService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngrxOnInitEffects(): Action {
    return refreshTrips();
  }

  refreshTrips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(refreshTrips),
      switchMap(() =>
        this.tripsService.getTrips().pipe(
          map((trips) => loadTripsSuccess({ trips })),
          catchError((error) => of(loadTripsFailure({ error: error?.error?.message ?? error?.message ?? 'Unknown error' })))
        )
      )
    )
  );

  wsTrips$ = createEffect(() =>
    this.isBrowser
      ? this.wsService.connect().pipe(
          map((trips) => wsTripsReceived({ trips })),
          retry({ delay: 3000 })
        )
      : EMPTY
  );
}
