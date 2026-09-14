import { TripFinanceEntry, TripFinanceRow } from '@models/lib/trip-finance.model';
import { TripRequester } from '@models/lib/trip.model';

/** Prefix for the synthetic key of a requestor who has no saved income yet. */
export const SUGGESTED_ROW_PREFIX = 'req:';

export const suggestedRowKey = (requesterId: string): string =>
  `${SUGGESTED_ROW_PREFIX}${requesterId}`;

/** Prefix for a standard expense line that has not been saved yet. */
export const PRESET_ROW_PREFIX = 'preset:';

/** Keyed by index, not name, so a duplicated preset can never collide. */
export const presetRowKey = (index: number): string => `${PRESET_ROW_PREFIX}${index}`;

const normalizeName = (name: string): string => name.trim().toLocaleLowerCase();

const byCreatedAt = (a: TripFinanceEntry, b: TripFinanceEntry): number =>
  a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);

const savedRow = (entry: TripFinanceEntry, orphaned = false): TripFinanceRow => ({
  key: entry.id,
  entry,
  requesterId: entry.requesterId,
  // The snapshotted name, not the live requester name — a later rename must not
  // rewrite what was true when the money was recorded.
  displayName: entry.name,
  amount: entry.amount,
  note: entry.note,
  orphaned,
});

/**
 * Plain chronological rows, with no merging — used by the payments tab, whose
 * entries are free-form name/amount lines with no canonical list behind them.
 */
export function buildFlatRows(entries: TripFinanceEntry[]): TripFinanceRow[] {
  return [...entries].sort(byCreatedAt).map((entry) => savedRow(entry));
}

/**
 * Merges saved expenses with the standard expense list: every preset occupies
 * its slot in route order — showing 0 € until an amount is recorded — and any
 * expense whose name is not a preset follows in the order it was added.
 *
 * Matching is by normalized name, since presets have no id of their own. A
 * preset renamed after saving therefore drops into the custom block and its
 * original slot reappears at 0 €, which is the honest reading: that standard
 * line has nothing recorded against it.
 */
export function buildExpenseRows(
  entries: TripFinanceEntry[],
  presets: readonly string[]
): TripFinanceRow[] {
  const byName = new Map<string, TripFinanceEntry>();
  for (const entry of entries) {
    const key = normalizeName(entry.name);
    // First saved entry wins a slot; a second one with the same name is custom.
    if (!byName.has(key)) byName.set(key, entry);
  }

  const claimed = new Set<string>();
  const presetRows = presets.map((preset, index): TripFinanceRow => {
    const entry = byName.get(normalizeName(preset));
    if (entry && !claimed.has(entry.id)) {
      claimed.add(entry.id);
      return savedRow(entry);
    }
    return {
      key: presetRowKey(index),
      entry: null,
      requesterId: null,
      displayName: preset,
      // 0, not null: an unfilled standard line genuinely cost nothing so far.
      amount: 0,
      note: null,
      orphaned: false,
    };
  });

  const customRows = entries
    .filter((entry) => !claimed.has(entry.id))
    .sort(byCreatedAt)
    .map((entry) => savedRow(entry));

  return [...presetRows, ...customRows];
}

/**
 * Merges saved income entries with the trip's requestors, in three blocks:
 * requestors (saved or blank suggestion) → custom payers → orphans.
 *
 * A requestor drops out of `requesters` as soon as their last dog leaves the
 * trip (the server derives that list from dogs), so their saved income lands in
 * the orphan block rather than disappearing — deleting a money record because of
 * a manifest edit would be unrecoverable.
 */
export function buildIncomeRows(
  entries: TripFinanceEntry[],
  requesters: TripRequester[]
): TripFinanceRow[] {
  const byRequesterId = new Map<string, TripFinanceEntry>();
  for (const entry of entries) {
    if (entry.requesterId) byRequesterId.set(entry.requesterId, entry);
  }
  const requesterIds = new Set(requesters.map((r) => r.requesterId));

  const requestorRows = requesters.map((requester): TripFinanceRow => {
    const entry = byRequesterId.get(requester.requesterId);
    if (entry) return savedRow(entry);
    return {
      key: suggestedRowKey(requester.requesterId),
      entry: null,
      requesterId: requester.requesterId,
      displayName: requester.name,
      // null renders a blank input; 0 would read as a real "paid nothing".
      amount: null,
      note: null,
      orphaned: false,
    };
  });

  const customRows = entries
    .filter((entry) => entry.requesterId === null)
    .sort(byCreatedAt)
    .map((entry) => savedRow(entry));

  const orphanRows = entries
    .filter((entry) => entry.requesterId !== null && !requesterIds.has(entry.requesterId))
    .sort(byCreatedAt)
    .map((entry) => savedRow(entry, true));

  return [...requestorRows, ...customRows, ...orphanRows];
}
