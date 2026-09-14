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

/**
 * A standard expense line for the route, with what it normally costs.
 *
 * Deliberately shaped like a server DTO even though the list is currently a
 * frontend constant: `buildExpenseRows` takes the array as a parameter, so
 * moving the list behind an endpoint later is a change of source, not of shape.
 */
export interface TripFinancePreset {
  name: string;
  /** null when the line has no standard price (food, diesel — it varies). */
  amount: number | null;
}

/** A zeroed standard line being topped back up to its normal price. */
export interface TripFinanceAmountUpdate {
  entryId: string;
  amount: number;
}

/**
 * What "fill standard lines" has to do. Two shapes because a standard line may
 * be missing entirely (create) or present at 0 after a reset (update) — the
 * latter must not become a second row with the same name.
 */
export interface TripFinanceStandardOps {
  creates: TripFinanceEntryPayload[];
  updates: TripFinanceAmountUpdate[];
}

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
  /**
   * What this line normally costs, on standard rows that have nothing recorded
   * yet — either unsaved, or saved at 0 after a reset. Never rendered as the
   * row's amount: an unsaved figure would show in the table while the summary
   * tiles (which sum saved entries) ignored it. It only seeds the editor and the
   * "fill standard lines" action, both of which write a real amount.
   */
  suggestedAmount: number | null;
  note: string | null;
  /** A saved income whose requestor no longer has dogs on this trip. */
  orphaned: boolean;
}
