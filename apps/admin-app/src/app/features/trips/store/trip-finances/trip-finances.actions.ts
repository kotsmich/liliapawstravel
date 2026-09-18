import { createAction, props } from '@ngrx/store';
import {
  TripFinanceEntry,
  TripFinanceEntryPayload,
  TripFinanceStandardOps,
} from '@models/lib/trip-finance.model';

export const loadTripFinances = createAction(
  '[Trip Finances] Load',
  props<{ tripId: string }>()
);
export const loadTripFinancesSuccess = createAction(
  '[Trip Finances] Load Success',
  props<{ tripId: string; entries: TripFinanceEntry[] }>()
);
export const loadTripFinancesFailure = createAction(
  '[Trip Finances] Load Failure',
  props<{ error: string }>()
);

// `rowKey` identifies the table row with the in-flight mutation so only that
// row shows a spinner. For an unsaved suggestion it is `req:<requesterId>`.
export const createTripFinanceEntry = createAction(
  '[Trip Finances] Create Entry',
  props<{ tripId: string; rowKey: string; payload: TripFinanceEntryPayload }>()
);
export const createTripFinanceEntrySuccess = createAction(
  '[Trip Finances] Create Entry Success',
  props<{ entry: TripFinanceEntry }>()
);
export const createTripFinanceEntryFailure = createAction(
  '[Trip Finances] Create Entry Failure',
  props<{ error: string }>()
);

/** `mutatingKey` for the batch fill — no single row owns it, so it spins the button. */
export const FILL_STANDARD_ROW_KEY = 'fill-standard';

// "Fill standard lines": one action for the whole batch so the table re-renders
// once, rather than flickering through twenty single-entry upserts.
//
// Carries creates *and* updates: after a reset the standard lines still exist at
// 0, so re-applying their prices has to update those rows, not add duplicates.
export const fillStandardExpenses = createAction(
  '[Trip Finances] Fill Standard Expenses',
  props<{ tripId: string; ops: TripFinanceStandardOps }>()
);
export const fillStandardExpensesSuccess = createAction(
  '[Trip Finances] Fill Standard Expenses Success',
  props<{ entries: TripFinanceEntry[] }>()
);
export const fillStandardExpensesFailure = createAction(
  '[Trip Finances] Fill Standard Expenses Failure',
  props<{ error: string }>()
);

/** `mutatingKey` for the batch reset — no single row owns it, so it spins the button. */
export const RESET_EXPENSES_ROW_KEY = 'reset-expenses';

// "Reset to 0": zeroes the amount on every saved expense, keeping names, notes
// and custom lines. One action for the batch so the table re-renders once.
export const resetExpenseAmounts = createAction(
  '[Trip Finances] Reset Expense Amounts',
  props<{ tripId: string; entryIds: string[] }>()
);
export const resetExpenseAmountsSuccess = createAction(
  '[Trip Finances] Reset Expense Amounts Success',
  props<{ entries: TripFinanceEntry[] }>()
);
export const resetExpenseAmountsFailure = createAction(
  '[Trip Finances] Reset Expense Amounts Failure',
  props<{ error: string }>()
);

// Inline autosave. `entryId` is null for a slot with nothing saved yet — a
// standard line or a requestor row. The effect creates that entry once and
// routes every later save for the same row to an update, so a burst of
// keystrokes can never produce duplicate lines.
export const saveTripFinanceRow = createAction(
  '[Trip Finances] Save Row',
  props<{ tripId: string; rowKey: string; entryId: string | null; payload: TripFinanceEntryPayload }>()
);
export const saveTripFinanceRowSuccess = createAction(
  '[Trip Finances] Save Row Success',
  props<{ entry: TripFinanceEntry }>()
);
export const saveTripFinanceRowFailure = createAction(
  '[Trip Finances] Save Row Failure',
  props<{ error: string }>()
);

export const deleteTripFinanceEntry = createAction(
  '[Trip Finances] Delete Entry',
  props<{ tripId: string; entryId: string; rowKey: string }>()
);
export const deleteTripFinanceEntrySuccess = createAction(
  '[Trip Finances] Delete Entry Success',
  props<{ id: string }>()
);
export const deleteTripFinanceEntryFailure = createAction(
  '[Trip Finances] Delete Entry Failure',
  props<{ error: string }>()
);
