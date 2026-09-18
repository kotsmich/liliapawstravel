import { TripFinanceEntry } from '@models/lib/trip-finance.model';
import { TripRequester } from '@models/lib/trip.model';
import {
  buildIncomeRows,
  buildPresetRows,
  hasStandardLineOps,
  missingStandardLines,
  standardLineOps,
} from './trip-finance-rows.util';

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

describe('buildPresetRows', () => {
  const presets = [
    { name: 'Φαγητα', amount: null },
    { name: 'Διοδια', amount: 40 },
    { name: 'Diesel Larisa', amount: null },
  ];

  it('lists every preset at 0, in route order, when nothing is saved', () => {
    const rows = buildPresetRows([], presets, 'expense');

    expect(rows.map((r) => r.displayName)).toEqual(presets.map((p) => p.name));
    // 0, not null — an unfilled standard line genuinely cost nothing so far.
    expect(rows.map((r) => r.amount)).toEqual([0, 0, 0]);
    expect(rows.map((r) => r.key)).toEqual([
      'preset:expense:0',
      'preset:expense:1',
      'preset:expense:2',
    ]);
  });

  it('namespaces slot keys by type, so expenses and payments never collide', () => {
    // A shared `preset:0` would let the store's create-once cache route a
    // payment's first save onto an expense entry.
    const expenseRows = buildPresetRows([], presets, 'expense');
    const paymentRows = buildPresetRows([], [{ name: 'Stelios', amount: null }], 'payment');

    expect(expenseRows[0].key).toBe('preset:expense:0');
    expect(paymentRows[0].key).toBe('preset:payment:0');
  });

  it('carries the standard price as a suggestion, never as the amount', () => {
    const rows = buildPresetRows([], presets, 'expense');

    // The tiles sum saved entries only, so a standard price must not reach
    // `amount` before it is recorded or the table would outrun the totals.
    expect(rows[1].amount).toBe(0);
    expect(rows[1].suggestedAmount).toBe(40);
    expect(rows[0].suggestedAmount).toBeNull();
  });

  it('drops the suggestion once the line has been recorded', () => {
    const saved = entry({ id: 'e-tolls', type: 'expense', name: 'Διοδια', amount: 35 });
    const rows = buildPresetRows([saved], presets, 'expense');

    expect(rows[1].amount).toBe(35);
    expect(rows[1].suggestedAmount).toBeNull();
  });

  it('resolves a saved entry into its preset slot, keeping list order', () => {
    const saved = entry({ id: 'e-tolls', type: 'expense', name: 'Διοδια', amount: 40 });
    const rows = buildPresetRows([saved], presets, 'expense');

    // The slot keeps its key once saved, so an open edit survives the first autosave.
    expect(rows.map((r) => r.key)).toEqual([
      'preset:expense:0',
      'preset:expense:1',
      'preset:expense:2',
    ]);
    expect(rows[1].entry?.id).toBe('e-tolls');
    expect(rows[1].amount).toBe(40);
  });

  it('matches presets case- and whitespace-insensitively', () => {
    const saved = entry({ id: 'e1', type: 'expense', name: '  diesel larisa ' });
    const rows = buildPresetRows([saved], presets, 'expense');

    expect(rows[2].key).toBe('preset:expense:2');
    expect(rows[2].entry?.id).toBe('e1');
    expect(rows.length).toBe(3);
  });

  it('puts a non-preset entry after the preset block', () => {
    const custom = entry({ id: 'e-wash', type: 'expense', name: 'Car wash' });
    const rows = buildPresetRows([custom], presets, 'expense');

    expect(rows.map((r) => r.key)).toEqual([
      'preset:expense:0',
      'preset:expense:1',
      'preset:expense:2',
      'e-wash',
    ]);
  });

  it('gives a second entry with a preset name its own custom row', () => {
    const first = entry({ id: 'a', type: 'expense', name: 'Διοδια', createdAt: '2026-01-01T00:00:00.000Z' });
    const second = entry({ id: 'b', type: 'expense', name: 'Διοδια', createdAt: '2026-01-02T00:00:00.000Z' });
    const rows = buildPresetRows([first, second], presets, 'expense');

    expect(rows.map((r) => r.key)).toEqual([
      'preset:expense:0',
      'preset:expense:1',
      'preset:expense:2',
      'b',
    ]);
    expect(rows[1].entry?.id).toBe('a');
  });
});

describe('standardLineOps', () => {
  const presets = [
    { name: 'Φαγητα', amount: null },
    { name: 'Διοδια', amount: 40 },
    { name: 'Viniet 1 Italy', amount: 80 },
  ];

  it('creates only the standard lines that have a price', () => {
    const ops = standardLineOps(buildPresetRows([], presets, 'expense'));

    // Φαγητα varies per trip and has no default — it must not be invented.
    expect(ops.creates).toEqual([
      { type: 'expense', name: 'Διοδια', amount: 40 },
      { type: 'expense', name: 'Viniet 1 Italy', amount: 80 },
    ]);
    expect(ops.updates).toEqual([]);
  });

  it('creates payment lines as payments, not expenses', () => {
    const paymentPresets = [{ name: 'Logistria 50%', amount: 62 }];
    const ops = standardLineOps(buildPresetRows([], paymentPresets, 'payment'), 'payment');

    expect(ops.creates).toEqual([{ type: 'payment', name: 'Logistria 50%', amount: 62 }]);
  });

  it('skips lines with a real amount, so a second run tops up rather than overwrites', () => {
    const saved = entry({ id: 'e-tolls', type: 'expense', name: 'Διοδια', amount: 35 });
    const ops = standardLineOps(buildPresetRows([saved], presets, 'expense'));

    expect(ops.creates).toEqual([{ type: 'expense', name: 'Viniet 1 Italy', amount: 80 }]);
    expect(ops.updates).toEqual([]);
  });

  it('updates a zeroed line instead of duplicating it, so a reset can be undone', () => {
    const zeroed = entry({ id: 'e-tolls', type: 'expense', name: 'Διοδια', amount: 0 });
    const ops = standardLineOps(buildPresetRows([zeroed], presets, 'expense'));

    expect(ops.updates).toEqual([{ entryId: 'e-tolls', amount: 40 }]);
    // Crucially not a create — that would leave two Διοδια rows.
    expect(ops.creates).toEqual([{ type: 'expense', name: 'Viniet 1 Italy', amount: 80 }]);
  });

  it('is empty once every priced line has a real amount, which hides the button', () => {
    const rows = buildPresetRows(
      [
        entry({ id: 'a', type: 'expense', name: 'Διοδια', amount: 35 }),
        entry({ id: 'b', type: 'expense', name: 'Viniet 1 Italy', amount: 80 }),
      ],
      presets,
      'expense'
    );

    expect(hasStandardLineOps(standardLineOps(rows))).toBe(false);
  });

  it('is fillable again after every line has been reset to 0', () => {
    const rows = buildPresetRows(
      [
        entry({ id: 'a', type: 'expense', name: 'Διοδια', amount: 0 }),
        entry({ id: 'b', type: 'expense', name: 'Viniet 1 Italy', amount: 0 }),
      ],
      presets,
      'expense'
    );
    const ops = standardLineOps(rows);

    expect(hasStandardLineOps(ops)).toBe(true);
    expect(ops.updates).toEqual([
      { entryId: 'a', amount: 40 },
      { entryId: 'b', amount: 80 },
    ]);
    expect(ops.creates).toEqual([]);
  });
});

describe('missingStandardLines', () => {
  const expensePresets = [
    { name: 'Διοδια', amount: 40 },
    { name: 'Φαγητα', amount: null },
  ];
  const paymentPresets = [
    { name: 'Logistria 50%', amount: 62 },
    { name: 'Stelios', amount: null },
  ];

  it('creates every priced line the trip does not have, across both lists', () => {
    const ops = missingStandardLines([], expensePresets, paymentPresets);

    // Lines without a standard price are never invented.
    expect(ops.creates).toEqual([
      { type: 'expense', name: 'Διοδια', amount: 40 },
      { type: 'payment', name: 'Logistria 50%', amount: 62 },
    ]);
    expect(ops.updates).toEqual([]);
  });

  it('never tops up a line saved at 0, so a reset survives the next reload', () => {
    const zeroed = entry({ id: 'a', type: 'expense', name: 'Διοδια', amount: 0 });
    const ops = missingStandardLines([zeroed], expensePresets, paymentPresets);

    expect(ops.creates).toEqual([{ type: 'payment', name: 'Logistria 50%', amount: 62 }]);
    expect(ops.updates).toEqual([]);
  });

  it('matches within a type, so an expense cannot satisfy a payment of the same name', () => {
    const sameName = entry({ id: 'a', type: 'expense', name: 'Logistria 50%', amount: 62 });
    const ops = missingStandardLines([sameName], expensePresets, paymentPresets);

    expect(ops.creates).toContain({ type: 'payment', name: 'Logistria 50%', amount: 62 });
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

    // The requestor keeps its slot key once saved — an open edit survives the first autosave.
    expect(rows.map((r) => r.key)).toEqual(['req:r1', 'req:r2']);
    expect(rows[0].entry?.id).toBe('e-maria');
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
