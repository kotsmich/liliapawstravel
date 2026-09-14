import { createAction, props } from '@ngrx/store';
import {
  TripFinanceEntry,
  TripFinanceEntryChanges,
  TripFinanceEntryPayload,
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

export const updateTripFinanceEntry = createAction(
  '[Trip Finances] Update Entry',
  props<{ tripId: string; entryId: string; rowKey: string; changes: TripFinanceEntryChanges }>()
);
export const updateTripFinanceEntrySuccess = createAction(
  '[Trip Finances] Update Entry Success',
  props<{ entry: TripFinanceEntry }>()
);
export const updateTripFinanceEntryFailure = createAction(
  '[Trip Finances] Update Entry Failure',
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
