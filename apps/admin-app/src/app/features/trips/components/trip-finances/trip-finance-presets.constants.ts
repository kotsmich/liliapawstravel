import { TripFinancePreset } from '@models/lib/trip-finance.model';

/**
 * Standard expense lines for the route, shown pre-listed at 0 € on every trip.
 * Only the ones the admin gives an amount to are ever persisted — an untouched
 * preset stays client-side and never reaches the database.
 *
 * Order is meaningful: it follows the route, so the table reads like the trip.
 *
 * `amount` is what the line normally costs, and it is *only* a starting point:
 * it seeds the row editor and the "fill standard lines" button, both of which
 * write a real entry. Nothing here is ever counted until it has been saved
 * against a trip, so changing a price below can never rewrite past trips.
 *
 * Leave `amount: null` for anything that genuinely varies per trip (fuel, food,
 * tolls) — a wrong default is worse than none, because it trains the admin to
 * distrust the ones that are right.
 *
 * TODO: the list is a frontend constant for now; when it moves behind
 * `GET /trip-finance-presets`, only the source changes — `buildExpenseRows`
 * already takes it as a parameter.
 */
export const EXPENSE_PRESETS: readonly TripFinancePreset[] = [
  { name: 'Πανες - Καθαριστικα', amount: 25 },
  { name: 'Φαγητα Δρομολογιο', amount: 30 },
  { name: 'Διοδια μαζι', amount: 50 },
  { name: 'Diesel Larisa', amount: 120 },
  { name: 'Add blue', amount: 15 },
  { name: 'Diesel Igoumenitsa', amount: 130 },
  { name: 'Πλοιο Igoumenitsa - Italy', amount: 750 },
  { name: 'Diesel Italy (πανε 1)', amount: 130 },
  { name: 'Diesel Italy (πανε 2)', amount: 40 },
  { name: 'Viniet 1 Italy', amount: 80 },
  { name: 'Tolls Austria μαζι', amount: 25 },
  { name: 'Βινιετα Αυστρια', amount: 12.5},
  { name: 'Diesel Kufstein', amount: 130 },
  { name: 'Diesel Germany', amount: 130 },
  { name: 'Diesel Kufstein 2', amount: 130 },
  { name: 'Hotel (Rest)', amount: 60 },
  { name: 'Hotel (End trip)', amount: 60 },
  { name: 'Hotel (Return)', amount: 60 },
  { name: 'Viniet 2 Italy', amount: 80 },
  { name: 'Πλοιο Italy - Igoumenitsa', amount: 300 },
  { name: 'On the road εξτρα', amount: 30},
  { name: 'Dinners', amount: 150},

];
