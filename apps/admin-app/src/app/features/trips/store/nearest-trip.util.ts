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

export function pickAutoSelectDate(trips: readonly Trip[]): string {
  const future = findNearestTrip(trips, { futureOnly: true });
  if (future) return future.date;
  const mostRecentPast = [...trips].map((trip) => trip.date).sort().at(-1);
  return mostRecentPast ?? today();
}
