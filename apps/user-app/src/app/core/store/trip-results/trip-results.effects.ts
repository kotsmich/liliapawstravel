import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { TripResultsService } from '@user/services/trip-results.service';
import {
  loadTripResults, loadTripResultsSuccess, loadTripResultsFailure,
  loadTripResultById, loadTripResultByIdSuccess, loadTripResultByIdFailure,
} from './trip-results.actions';

const toMessage = (error: any): string =>
  error?.error?.message ?? error?.message ?? 'Unknown error';

@Injectable()
export class TripResultsEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(TripResultsService);

  loadTripResults$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTripResults),
      switchMap(() =>
        this.service.getTripResults().pipe(
          map((results) => loadTripResultsSuccess({ results })),
          catchError((error) => of(loadTripResultsFailure({ error: toMessage(error) })))
        )
      )
    )
  );

  loadTripResultById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTripResultById),
      switchMap(({ id }) =>
        this.service.getTripResultById(id).pipe(
          map((result) => loadTripResultByIdSuccess({ result })),
          catchError((error) => of(loadTripResultByIdFailure({ error: toMessage(error) })))
        )
      )
    )
  );
}
