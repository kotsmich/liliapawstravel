import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, filter, forkJoin, groupBy, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { TripFinancesService } from '@admin/services/trip-finances.service';
import { extractError } from '@admin/shared/utils/extract-error';
import { missingStandardLines } from '@admin/features/trips/components/trip-finances/trip-finance-rows.util';
import {
  EXPENSE_PRESETS,
  PAYMENT_PRESETS,
} from '@admin/features/trips/components/trip-finances/trip-finance-presets.constants';
import {
  loadTripFinances, loadTripFinancesSuccess, loadTripFinancesFailure,
  createTripFinanceEntry, createTripFinanceEntrySuccess, createTripFinanceEntryFailure,
  fillStandardExpenses, fillStandardExpensesSuccess, fillStandardExpensesFailure,
  resetExpenseAmounts, resetExpenseAmountsSuccess, resetExpenseAmountsFailure,
  saveTripFinanceRow, saveTripFinanceRowSuccess, saveTripFinanceRowFailure,
  deleteTripFinanceEntry, deleteTripFinanceEntrySuccess, deleteTripFinanceEntryFailure,
} from './trip-finances.actions';

@Injectable()
export class TripFinancesEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(TripFinancesService);

  /**
   * Entry ids learned from autosave creates, keyed by `${tripId}|${rowKey}`.
   * Lets a save queued behind a slot's first create update that new entry
   * instead of creating a second one.
   */
  private readonly createdIds = new Map<string, string>();

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

  /**
   * Standard lines apply themselves. As soon as a trip's finances load, every
   * priced preset it doesn't have yet is recorded — so the usual expenses reach
   * ΚΕΡΔΟΣ and the usual payouts reach ΤΕΛΙΚΟ ΥΠΟΛΟΙΠΟ without anyone typing
   * them, and the tables always agree with the tiles.
   *
   * It cannot loop: the fill's success upserts entries rather than reloading,
   * and a later reload finds nothing missing. Lines zeroed by a reset stay
   * zeroed — `missingStandardLines` only ever creates what is absent.
   */
  autoApplyStandardLines$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTripFinancesSuccess),
      map(({ tripId, entries }) => ({
        tripId,
        ops: missingStandardLines(entries, EXPENSE_PRESETS, PAYMENT_PRESETS),
      })),
      filter(({ ops }) => ops.creates.length > 0),
      map(({ tripId, ops }) => fillStandardExpenses({ tripId, ops }))
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

  /**
   * Autosave, serialised per row: `groupBy` splits the stream by row and
   * `concatMap` runs each row's saves strictly in order. Two guarantees follow —
   * a later keystroke can never be overwritten by an earlier save finishing
   * last, and a slot's first create always completes (recording its id) before
   * the next save for that row decides between create and update.
   *
   * Rows are independent groups, so typing in one never waits on another.
   */
  saveTripFinanceRow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveTripFinanceRow),
      groupBy(({ tripId, rowKey }) => `${tripId}|${rowKey}`),
      mergeMap((row$) =>
        row$.pipe(
          concatMap(({ tripId, rowKey, entryId, payload }) => {
            const slot = `${tripId}|${rowKey}`;
            const knownId = entryId ?? this.createdIds.get(slot);

            const request$ = knownId
              ? this.service.updateEntry(tripId, knownId, {
                  name: payload.name,
                  amount: payload.amount,
                  // '' rather than omitted, so clearing a note actually clears it.
                  note: payload.note ?? '',
                })
              : this.service
                  .createEntry(tripId, payload)
                  .pipe(tap((entry) => this.createdIds.set(slot, entry.id)));

            return request$.pipe(
              map((entry) => saveTripFinanceRowSuccess({ entry })),
              catchError((error) => of(saveTripFinanceRowFailure({ error: extractError(error) })))
            );
          })
        )
      )
    )
  );

  /**
   * Keeps `createdIds` honest: a reload makes every remembered id redundant, and
   * a deleted entry must not be updated by a later save into its now-empty slot.
   */
  forgetCreatedIds$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loadTripFinances, deleteTripFinanceEntrySuccess),
        tap((action) => {
          if (!('id' in action)) {
            this.createdIds.clear();
            return;
          }
          for (const [slot, id] of this.createdIds) {
            if (id === action.id) this.createdIds.delete(slot);
          }
        })
      ),
    { dispatch: false }
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
