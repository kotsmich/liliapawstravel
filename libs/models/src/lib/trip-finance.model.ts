/**
 * `payment` is an outgoing log — what we handed over and to whom. It is
 * deliberately NOT part of the income/expense/profit arithmetic.
 */
export type TripFinanceEntryType = 'expense' | 'income' | 'payment';

/** How an income actually arrived. This order is the order of the columns. */
export const TRIP_FINANCE_METHODS = [
  'paidCash',
  'paidPaypal',
  'paidRevolut',
  'paidCredia',
] as const;

export type TripFinanceMethod = (typeof TRIP_FINANCE_METHODS)[number];

/** A saved money line on a trip, as returned by the API. */
export interface TripFinanceEntry {
  id: string;
  tripId: string;
  type: TripFinanceEntryType;
  name: string;
  /** For an income, what the payer owes in total; for the rest, simply the amount. */
  amount: number;
  /** Incomes only: how much of the total arrived by each method. */
  paidCash: number;
  paidPaypal: number;
  paidRevolut: number;
  paidCredia: number;
  note: string | null;
  /** Incomes only; null for expenses, payments, and custom (non-adopter) payers. */
  requesterId: string | null;
  createdAt: string;
}

export interface TripFinanceEntryPayload {
  type: TripFinanceEntryType;
  name: string;
  amount: number;
  paidCash?: number;
  paidPaypal?: number;
  paidRevolut?: number;
  paidCredia?: number;
  note?: string;
  requesterId?: string;
}

/** The API rejects `type` and `requesterId` on update — payer link is fixed at creation. */
export type TripFinanceEntryChanges = Partial<
  Pick<
    TripFinanceEntryPayload,
    'name' | 'amount' | 'note' | 'paidCash' | 'paidPaypal' | 'paidRevolut' | 'paidCredia'
  >
>;

/**
 * A standard expense line for the route, with what it normally costs.
 *
 * Deliberately shaped like a server DTO even though the list is currently a
 * frontend constant: `buildPresetRows` takes the array as a parameter, so
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
  /** What the payers owe in total. Collection is tracked separately. */
  incomeTotal: number;
  expenseTotal: number;
  profit: number;
}

/**
 * A row in the expenses or payments table: either a saved entry, or a standard
 * line that has not been recorded yet.
 */
export interface TripFinanceRow {
  /**
   * Stable identity for `track`. Slot rows keep one key whether saved or not —
   * `preset:<type>:<index>` for a standard line — so an open edit survives the
   * row's first autosave. Every other row is keyed by its entry id.
   */
  key: string;
  entry: TripFinanceEntry | null;
  requesterId: string | null;
  displayName: string;
  /** null renders a blank input; 0 is a real "paid nothing". */
  amount: number | null;
  /**
   * What this standard line normally costs, on rows with nothing recorded yet.
   * Never rendered as the row's amount: an unsaved figure would show in the
   * table while the summary tiles (which sum saved entries) ignored it.
   */
  suggestedAmount: number | null;
  note: string | null;
  /** Unused on these two tabs; kept so one table component serves both. */
  orphaned: boolean;
}

/**
 * A row on the incomes tab. Every one is a real entry — the server seeds one
 * per adopter, and from then on the list belongs to the admin to rename,
 * delete and add to, independently of the dogs on the trip.
 */
export interface TripFinanceIncomeRow {
  key: string;
  entry: TripFinanceEntry;
  name: string;
  /** What this payer owes in total. */
  total: number;
  /** The four methods added up. */
  paid: number;
  /** total − paid; 0 once they have settled up. */
  remaining: number;
}
