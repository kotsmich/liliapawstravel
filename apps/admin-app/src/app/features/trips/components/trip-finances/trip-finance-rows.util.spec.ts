import { TripFinanceEntry } from '@models/lib/trip-finance.model';
import { TripRequester } from '@models/lib/trip.model';
import { buildExpenseRows, buildFlatRows, buildIncomeRows } from './trip-finance-rows.util';

const entry = (over: Partial<TripFinanceEntry>): TripFinanceEntry => ({
  id: 'e1',
  tripId: 't1',
  type: 'income',
  name: 'Entry',
  amount: 100,
  note: null,
  requesterId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

const requester = (id: string, name: string): TripRequester => ({
  requesterId: id,
  name,
  email: null,
  phone: null,
  sourceRequestId: null,
  dogs: [],
});

describe('buildFlatRows', () => {
  it('sorts by createdAt and keys rows by entry id', () => {
    const rows = buildFlatRows([
      entry({ id: 'b', type: 'expense', createdAt: '2026-01-02T00:00:00.000Z' }),
      entry({ id: 'a', type: 'expense', createdAt: '2026-01-01T00:00:00.000Z' }),
    ]);

    expect(rows.map((r) => r.key)).toEqual(['a', 'b']);
    expect(rows.every((r) => r.entry !== null)).toBe(true);
  });
});

describe('buildExpenseRows', () => {
  const presets = ['Φαγητα', 'Διοδια', 'Diesel Larisa'];

  it('lists every preset at 0, in route order, when nothing is saved', () => {
    const rows = buildExpenseRows([], presets);

    expect(rows.map((r) => r.displayName)).toEqual(presets);
    // 0, not null — an unfilled standard line genuinely cost nothing so far.
    expect(rows.map((r) => r.amount)).toEqual([0, 0, 0]);
    expect(rows.map((r) => r.key)).toEqual(['preset:0', 'preset:1', 'preset:2']);
  });

  it('resolves a saved expense into its preset slot, keeping route order', () => {
    const saved = entry({ id: 'e-tolls', type: 'expense', name: 'Διοδια', amount: 40 });
    const rows = buildExpenseRows([saved], presets);

    expect(rows.map((r) => r.key)).toEqual(['preset:0', 'e-tolls', 'preset:2']);
    expect(rows[1].amount).toBe(40);
  });

  it('matches presets case- and whitespace-insensitively', () => {
    const saved = entry({ id: 'e1', type: 'expense', name: '  diesel larisa ' });
    const rows = buildExpenseRows([saved], presets);

    expect(rows[2].key).toBe('e1');
    expect(rows.length).toBe(3);
  });

  it('puts a non-preset expense after the preset block', () => {
    const custom = entry({ id: 'e-wash', type: 'expense', name: 'Car wash' });
    const rows = buildExpenseRows([custom], presets);

    expect(rows.map((r) => r.key)).toEqual(['preset:0', 'preset:1', 'preset:2', 'e-wash']);
  });

  it('gives a second entry with a preset name its own custom row', () => {
    const first = entry({ id: 'a', type: 'expense', name: 'Διοδια', createdAt: '2026-01-01T00:00:00.000Z' });
    const second = entry({ id: 'b', type: 'expense', name: 'Διοδια', createdAt: '2026-01-02T00:00:00.000Z' });
    const rows = buildExpenseRows([first, second], presets);

    expect(rows.map((r) => r.key)).toEqual(['preset:0', 'a', 'preset:2', 'b']);
  });
});

describe('buildIncomeRows', () => {
  const requesters = [requester('r1', 'Maria'), requester('r2', 'John')];

  it('lists every requestor, blank when there is no saved entry', () => {
    const rows = buildIncomeRows([], requesters);

    expect(rows.map((r) => r.key)).toEqual(['req:r1', 'req:r2']);
    expect(rows.map((r) => r.displayName)).toEqual(['Maria', 'John']);
    // null, not 0 — the input must render empty rather than as a real zero.
    expect(rows.map((r) => r.amount)).toEqual([null, null]);
    expect(rows.every((r) => r.entry === null)).toBe(true);
  });

  it('resolves a saved entry into the requestor slot, keeping its position', () => {
    const saved = entry({ id: 'e-maria', requesterId: 'r1', name: 'Maria', amount: 350 });
    const rows = buildIncomeRows([saved], requesters);

    expect(rows.map((r) => r.key)).toEqual(['e-maria', 'req:r2']);
    expect(rows[0].amount).toBe(350);
    expect(rows[0].orphaned).toBe(false);
  });

  it('uses the snapshotted entry name, not the live requester name', () => {
    const saved = entry({ id: 'e1', requesterId: 'r1', name: 'Maria K.' });
    const rows = buildIncomeRows([saved], [requester('r1', 'Maria Kowalski')]);

    expect(rows[0].displayName).toBe('Maria K.');
  });

  it('puts custom payers after the requestor block', () => {
    const custom = entry({ id: 'e-shop', requesterId: null, name: 'Pet shop' });
    const rows = buildIncomeRows([custom], requesters);

    expect(rows.map((r) => r.key)).toEqual(['req:r1', 'req:r2', 'e-shop']);
    expect(rows[2].requesterId).toBeNull();
  });

  it('flags a saved income whose requestor left the trip and keeps it last', () => {
    const gone = entry({ id: 'e-anna', requesterId: 'r9', name: 'Anna', amount: 120 });
    const rows = buildIncomeRows([gone], requesters);

    expect(rows.map((r) => r.key)).toEqual(['req:r1', 'req:r2', 'e-anna']);
    expect(rows[2].orphaned).toBe(true);
    expect(rows[2].amount).toBe(120);
  });

  it('treats an income whose requester FK was nulled as a plain custom payer', () => {
    const nulled = entry({ id: 'e-anna', requesterId: null, name: 'Anna' });
    const rows = buildIncomeRows([nulled], requesters);

    expect(rows[2].orphaned).toBe(false);
    expect(rows[2].displayName).toBe('Anna');
  });
});
