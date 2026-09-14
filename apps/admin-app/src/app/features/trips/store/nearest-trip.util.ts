import { Trip, TripStatus } from '@models/lib/trip.model';

const today = (): string => new Date().toISOString().slice(0, 10);

export interface NearestTripCriteria {
  status?: TripStatus;
  futureOnly?: boolean;
}

export function findNearestTrip(
  trips: readonly Trip[],
  { status, futureOnly = true }: NearestTripCriteria = {},
): Trip | null {
  const todayIso = today();
  const filtered = trips.filter((trip) => {
    if (status && trip.status !== status) return false;
    if (futureOnly && trip.date < todayIso) return false;
    return true;
  });
  return [...filtered].sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
}

export function findLatestPastTrip(trips: readonly Trip[]): Trip | null {
  const todayIso = today();
  return [...trips]
    .filter((trip) => trip.date < todayIso)
    .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}

// Prefers the next trip from today onwards. With nothing scheduled ahead it
// falls back to the most recent past trip so its details are one click away
// (the view still warns that nothing is upcoming), and to today when there
// are no trips at all.
export function pickAutoSelectDate(trips: readonly Trip[]): string {
  return findNearestTrip(trips, { futureOnly: true })?.date
    ?? findLatestPastTrip(trips)?.date
    ?? today();
}
