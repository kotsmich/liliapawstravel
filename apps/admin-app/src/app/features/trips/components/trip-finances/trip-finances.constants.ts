export type TripFinancesTab = 'expenses' | 'incomes' | 'payments';

/** Incomes lead: what came in is the first thing the admin checks. */
export const TRIP_FINANCES_DEFAULT_TAB: TripFinancesTab = 'incomes';

/**
 * One add bar per tab is kept alive at once so a half-typed line survives a tab
 * switch. Order matches the tab strip.
 */
export const TRIP_FINANCES_ADD_MODES = ['income', 'expense', 'payment'] as const;
