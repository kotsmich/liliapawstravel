import {
  TripFinanceEntry,
  TripFinanceEntryType,
  TripFinancePreset,
  TripFinanceRow,
  TripFinanceStandardOps,
} from '@models/lib/trip-finance.model';
import { TripRequester } from '@models/lib/trip.model';

/** Prefix for the synthetic key of a requestor who has no saved income yet. */
export const SUGGESTED_ROW_PREFIX = 'req:';

export const suggestedRowKey = (requesterId: string): string =>
  `${SUGGESTED_ROW_PREFIX}${requesterId}`;

/** Prefix for a standard line — expense or payment — that has not been saved yet. */
export const PRESET_ROW_PREFIX = 'preset:';

/**
 * Keyed by index rather than name, so a duplicated preset can never collide,
 * and namespaced by type: expenses and payments keep separate lists, and a
 * shared `preset:0` would let the store's create-once cache mix the two up.
 */
export const presetRowKey = (type: TripFinanceEntryType, index: number): string =>
  `${PRESET_ROW_PREFIX}${type}:${index}`;

const normalizeName = (name: string): string => name.trim().toLocaleLowerCase();

const byCreatedAt = (a: TripFinanceEntry, b: TripFinanceEntry): number =>
  a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);

/**
 * `key` defaults to the entry id, but rows that occupy a fixed slot — a standard
 * line or a trip requestor — pass the slot key instead, so the key is identical
 * before and after the entry is first saved. That's what lets an open inline
 * edit (and its autosave queue) survive its own first save.
 */
const savedRow = (
  entry: TripFinanceEntry,
  orphaned = false,
  suggestedAmount: number | null = null,
  key: string = entry.id
): TripFinanceRow => ({
  key,
  entry,
  requesterId: entry.requesterId,
  // The snapshotted name, not the live requester name — a later rename must not
  // rewrite what was true when the money was recorded.
  displayName: entry.name,
  amount: entry.amount,
  suggestedAmount,
  note: entry.note,
  orphaned,
});

/**
 * Merges saved entries with a standard list — the route's expense lines, or the
 * usual payouts. Every preset occupies its slot in list order, showing 0 € until
 * an amount is recorded, and anything whose name is not a preset follows in the
 * order it was added.
 *
 * Matching is by normalized name, since presets have no id of their own. A
 * preset renamed after saving therefore drops into the custom block and its
 * original slot reappears at 0 €, which is the honest reading: that standard
 * line has nothing recorded against it.
 */
export function buildPresetRows(
  entries: TripFinanceEntry[],
  presets: readonly TripFinancePreset[],
  type: TripFinanceEntryType
): TripFinanceRow[] {
  const byName = new Map<string, TripFinanceEntry>();
  for (const entry of entries) {
    const key = normalizeName(entry.name);
    // First saved entry wins a slot; a second one with the same name is custom.
    if (!byName.has(key)) byName.set(key, entry);
  }

  const claimed = new Set<string>();
  const presetRows = presets.map((preset, index): TripFinanceRow => {
    const entry = byName.get(normalizeName(preset.name));
    if (entry && !claimed.has(entry.id)) {
      claimed.add(entry.id);
      // A saved line sitting at 0 has nothing recorded against it yet — most
      // often because the tab was just reset — so it keeps its suggestion and
      // stays fillable. A real amount drops the suggestion.
      return savedRow(
        entry,
        false,
        entry.amount === 0 ? preset.amount : null,
        presetRowKey(type, index)
      );
    }
    return {
      key: presetRowKey(type, index),
      entry: null,
      requesterId: null,
      displayName: preset.name,
      // 0, not null: an unfilled standard line genuinely cost nothing so far.
      // The standard price rides along in suggestedAmount and stays out of the
      // displayed figure until it has been saved.
      amount: 0,
      suggestedAmount: preset.amount,
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
 * What "fill standard lines" would do: apply the standard price to every
 * standard line that has one and nothing recorded against it.
 *
 * A missing line is created; a line sitting at 0 — which is what a reset leaves
 * behind — is updated in place rather than duplicated. Lines with a real amount
 * are left alone, which is what makes the action safe to run twice: adding a
 * preset mid-season tops up the gap on a trip already under way without
 * overwriting anything the admin typed.
 */
export function standardLineOps(
  rows: TripFinanceRow[],
  type: TripFinanceEntryType = 'expense'
): TripFinanceStandardOps {
  const ops: TripFinanceStandardOps = { creates: [], updates: [] };
  for (const row of rows) {
    if (row.suggestedAmount === null) continue;
    if (row.entry) {
      ops.updates.push({ entryId: row.entry.id, amount: row.suggestedAmount });
    } else {
      ops.creates.push({ type, name: row.displayName, amount: row.suggestedAmount });
    }
  }
  return ops;
}

/** True when the fill action would change something. */
export const hasStandardLineOps = (ops: TripFinanceStandardOps): boolean =>
  ops.creates.length > 0 || ops.updates.length > 0;

/**
 * The priced standard lines a trip is missing altogether, across both lists —
 * what gets recorded automatically when a trip's finances are opened, so the
 * usual expenses and payouts count without anyone typing them.
 *
 * Creates only, deliberately: a line already saved at 0 was zeroed on purpose,
 * by "reset to 0" or by hand, and topping it back up on every reload would undo
 * that. Re-applying those prices stays a manual choice — the fill button.
 */
export function missingStandardLines(
  entries: TripFinanceEntry[],
  expensePresets: readonly TripFinancePreset[],
  paymentPresets: readonly TripFinancePreset[]
): TripFinanceStandardOps {
  const createsFor = (
    type: TripFinanceEntryType,
    presets: readonly TripFinancePreset[]
  ) =>
    standardLineOps(
      buildPresetRows(entries.filter((entry) => entry.type === type), presets, type),
      type
    ).creates;

  return {
    creates: [...createsFor('expense', expensePresets), ...createsFor('payment', paymentPresets)],
    updates: [],
  };
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
    if (entry) return savedRow(entry, false, null, suggestedRowKey(requester.requesterId));
    return {
      key: suggestedRowKey(requester.requesterId),
      entry: null,
      requesterId: requester.requesterId,
      displayName: requester.name,
      // null renders a blank input; 0 would read as a real "paid nothing".
      amount: null,
      // Incomes have no standard price — what a payer owes is per trip.
      suggestedAmount: null,
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
