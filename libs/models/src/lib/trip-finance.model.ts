/**
 * `payment` is an outgoing log — what we handed over and to whom. It is
 * deliberately NOT part of the income/expense/profit arithmetic.
 */
export type TripFinanceEntryType = 'expense' | 'income' | 'payment';

/** A saved money line on a trip, as returned by the API. */
export interface TripFinanceEntry {
  id: string;
  tripId: string;
  type: TripFinanceEntryType;
  name: string;
  amount: number;
  note: string | null;
  /** Incomes only; null for expenses, payments, and custom (non-requestor) payers. */
  requesterId: string | null;
  createdAt: string;
}

export interface TripFinanceEntryPayload {
  type: TripFinanceEntryType;
  name: string;
  amount: number;
  note?: string;
  requesterId?: string;
}

/** The API rejects `type` and `requesterId` on update — payer link is fixed at creation. */
export type TripFinanceEntryChanges = Partial<
  Pick<TripFinanceEntryPayload, 'name' | 'amount' | 'note'>
>;

export interface TripFinanceSummary {
  incomeTotal: number;
  expenseTotal: number;
  profit: number;
}

/**
 * A row in the finances table: either a saved entry, or — on the incomes tab —
 * a trip requestor who has no entry yet and is shown as a blank suggestion.
 */
export interface TripFinanceRow {
  /** Entry id when saved, `req:${requesterId}` for an unsaved suggestion. Used for `track`. */
  key: string;
  entry: TripFinanceEntry | null;
  requesterId: string | null;
  displayName: string;
  /** null renders a blank input; 0 is a real "paid nothing". */
  amount: number | null;
  note: string | null;
  /** A saved income whose requestor no longer has dogs on this trip. */
  orphaned: boolean;
}
