import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, forkJoin, map, mergeMap, of, switchMap } from 'rxjs';
import { TripFinancesService } from '@admin/services/trip-finances.service';
import { extractError } from '@admin/shared/utils/extract-error';
import {
  loadTripFinances, loadTripFinancesSuccess, loadTripFinancesFailure,
  createTripFinanceEntry, createTripFinanceEntrySuccess, createTripFinanceEntryFailure,
  fillStandardExpenses, fillStandardExpensesSuccess, fillStandardExpensesFailure,
  resetExpenseAmounts, resetExpenseAmountsSuccess, resetExpenseAmountsFailure,
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

  /**
   * No bulk endpoint exists, so the batch is N parallel requests joined back
   * into one success action. Creates add the missing standard lines; updates
   * top up the ones left at 0 by a reset, so re-filling never duplicates a row.
   *
   * forkJoin is all-or-nothing by design: a partial fill would leave the admin
   * guessing which lines landed, and the action is safe to retry because it only
   * ever touches lines with nothing recorded against them.
   */
  fillStandardExpenses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fillStandardExpenses),
      switchMap(({ tripId, ops }) =>
        forkJoin([
          ...ops.creates.map((payload) => this.service.createEntry(tripId, payload)),
          ...ops.updates.map(({ entryId, amount }) =>
            this.service.updateEntry(tripId, entryId, { amount })
          ),
        ]).pipe(
          map((entries) => fillStandardExpensesSuccess({ entries })),
          catchError((error) => of(fillStandardExpensesFailure({ error: extractError(error) })))
        )
      )
    )
  );

  /**
   * Same shape as the fill above: N parallel PUTs joined into one success.
   * Only the amount is sent, so names, notes and custom lines survive.
   */
  resetExpenseAmounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resetExpenseAmounts),
      switchMap(({ tripId, entryIds }) =>
        forkJoin(
          entryIds.map((entryId) => this.service.updateEntry(tripId, entryId, { amount: 0 }))
        ).pipe(
          map((entries) => resetExpenseAmountsSuccess({ entries })),
          catchError((error) => of(resetExpenseAmountsFailure({ error: extractError(error) })))
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
