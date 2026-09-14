/**
 * Standard expense lines for a trip, shown pre-listed at 0 € on every trip.
 * Only the ones the admin gives an amount to are ever persisted — an untouched
 * preset stays client-side and never reaches the database.
 *
 * Order is meaningful: it follows the route, so the table reads like the trip.
 */
export const EXPENSE_PRESETS: readonly string[] = [
  'Φαγητα',
  'Πανες - Καθαριστικα',
  'Διοδια',
  'Diesel Larisa',
  'Add blue',
  'Diesel Igoumenitsa',
  'Πλοιο Igoumenitsa - Italy',
  'Πλοιο Italy - Igoumenitsa',
  'Viniet 1 Italy',
  'Viniet 2 Italy',
  'Diesel Italy',
  'Diesel Kufstein',
  'Diesel Germany',
  'Tolls Austria',
  'Hotel (Rest)',
  'Hotel (End trip)',
  'Hotel (Return)',
] as const;
