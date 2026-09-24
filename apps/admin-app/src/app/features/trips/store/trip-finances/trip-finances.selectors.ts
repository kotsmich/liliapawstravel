import { createSelector, MemoizedSelector } from '@ngrx/store';
import { TripFinanceEntry, TripFinanceSummary } from '@models/lib/trip-finance.model';
import { adapter, selectTripFinancesState } from './trip-finances.reducer';

const { selectAll } = adapter.getSelectors(selectTripFinancesState);

export const selectTripFinancesLoading = createSelector(
  selectTripFinancesState,
  (state) => state.loading
);
export const selectTripFinancesMutatingKey = createSelector(
  selectTripFinancesState,
  (state) => state.mutatingKey
);
export const selectTripFinancesLoadedTripId = createSelector(
  selectTripFinancesState,
  (state) => state.loadedTripId
);

/** [] unless the store currently holds *this* trip — kills stale-money flashes. */
const selectEntriesForTrip = (tripId: string) =>
  createSelector(selectAll, selectTripFinancesLoadedTripId, (entries, loadedTripId) =>
    loadedTripId === tripId ? entries : []
  );

/** Sum via integer cents so 0.10 + 0.20 is 0.30, not 0.30000000000000004. */
const sumAmounts = (entries: TripFinanceEntry[]): number =>
  entries.reduce((acc, entry) => acc + Math.round(entry.amount * 100), 0) / 100;

/**
 * Money actually received. An income's `amount` is what the payer owes, so
 * summing that instead would count cash nobody has handed over yet.
 */
const sumReceived = (entries: TripFinanceEntry[]): number =>
  entries.reduce(
    (acc, entry) =>
      acc +
      Math.round(entry.paidCash * 100) +
      Math.round(entry.paidPaypal * 100) +
      Math.round(entry.paidRevolut * 100) +
      Math.round(entry.paidCredia * 100),
    0
  ) / 100;

interface TripFinancesSelectors {
  expenses: MemoizedSelector<object, TripFinanceEntry[]>;
  incomes: MemoizedSelector<object, TripFinanceEntry[]>;
  /** Outgoing log only — deliberately absent from `summary`. */
  payments: MemoizedSelector<object, TripFinanceEntry[]>;
  paymentsTotal: MemoizedSelector<object, number>;
  /** What the adopters still owe, across every income row. */
  incomeOutstanding: MemoizedSelector<object, number>;
  summary: MemoizedSelector<object, TripFinanceSummary>;
}

const _cache = new Map<string, TripFinancesSelectors>();

/**
 * Selectors are memoized per trip id — building them inline in a component
 * would allocate a fresh, always-recomputing selector on every change detection.
 */
export const tripFinancesSelectors = (tripId: string): TripFinancesSelectors => {
  const cached = _cache.get(tripId);
  if (cached) return cached;

  const entries = selectEntriesForTrip(tripId);
  const expenses = createSelector(entries, (all) => all.filter((e) => e.type === 'expense'));
  const incomes = createSelector(entries, (all) => all.filter((e) => e.type === 'income'));
  const payments = createSelector(entries, (all) => all.filter((e) => e.type === 'payment'));
  const paymentsTotal = createSelector(payments, sumAmounts);
  const incomeOutstanding = createSelector(
    incomes,
    (all) => Math.round((sumAmounts(all) - sumReceived(all)) * 100) / 100
  );

  // Income counts what the payers owe, not what has arrived: the trip is judged
  // on the agreed fares, and collection is tracked separately by the method
  // columns and `incomeOutstanding`.
  //
  // Payments are intentionally not an input here — they are a log of what went
  // out, not part of the trip's profit.
  const summary = createSelector(expenses, incomes, (exp, inc): TripFinanceSummary => {
    const expenseTotal = sumAmounts(exp);
    const incomeTotal = sumAmounts(inc);
    return {
      incomeTotal,
      expenseTotal,
      profit: Math.round((incomeTotal - expenseTotal) * 100) / 100,
    };
  });

  const selectors: TripFinancesSelectors = {
    expenses,
    incomes,
    payments,
    paymentsTotal,
    incomeOutstanding,
    summary,
  };
  _cache.set(tripId, selectors);
  return selectors;
};

export const clearTripFinancesSelectorCache = (): void => _cache.clear();
