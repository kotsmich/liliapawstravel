import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { TripFinancesService } from '@admin/services/trip-finances.service';
import { extractError } from '@admin/shared/utils/extract-error';
import {
  loadTripFinances, loadTripFinancesSuccess, loadTripFinancesFailure,
  createTripFinanceEntry, createTripFinanceEntrySuccess, createTripFinanceEntryFailure,
  updateTripFinanceEntry, updateTripFinanceEntrySuccess, updateTripFinanceEntryFailure,
  deleteTripFinanceEntry, deleteTripFinanceEntrySuccess, deleteTripFinanceEntryFailure,
} from './trip-finances.actions';

@Injectable()
export class TripFinancesEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(TripFinancesService);

  loadTripFinances$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTripFinances),
      switchMap(({ tripId }) =>
        this.service.getEntries(tripId).pipe(
          map((entries) => loadTripFinancesSuccess({ tripId, entries })),
          catchError((error) => of(loadTripFinancesFailure({ error: extractError(error) })))
        )
      )
    )
  );

  createTripFinanceEntry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createTripFinanceEntry),
      mergeMap(({ tripId, payload }) =>
        this.service.createEntry(tripId, payload).pipe(
          map((entry) => createTripFinanceEntrySuccess({ entry })),
          catchError((error) => of(createTripFinanceEntryFailure({ error: extractError(error) })))
        )
      )
    )
  );

  updateTripFinanceEntry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateTripFinanceEntry),
      mergeMap(({ tripId, entryId, changes }) =>
        this.service.updateEntry(tripId, entryId, changes).pipe(
          map((entry) => updateTripFinanceEntrySuccess({ entry })),
          catchError((error) => of(updateTripFinanceEntryFailure({ error: extractError(error) })))
        )
      )
    )
  );

  deleteTripFinanceEntry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteTripFinanceEntry),
      mergeMap(({ tripId, entryId }) =>
        this.service.deleteEntry(tripId, entryId).pipe(
          map(({ id }) => deleteTripFinanceEntrySuccess({ id })),
          catchError((error) => of(deleteTripFinanceEntryFailure({ error: extractError(error) })))
        )
      )
    )
  );
}
