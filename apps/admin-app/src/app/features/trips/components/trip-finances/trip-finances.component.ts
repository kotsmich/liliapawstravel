import {
  ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal, viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { switchMap } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { LoadingSpinnerComponent } from '@ui/lib/loading-spinner/loading-spinner.component';
import {
  TripFinanceEntry,
  TripFinanceEntryPayload,
  TripFinanceEntryType,
  TripFinanceIncomeRow,
  TripFinanceRow,
  TripFinanceSummary,
} from '@models/lib/trip-finance.model';
import { Trip } from '@models/lib/trip.model';
import { ConfirmActionService } from '@admin/shared/services/confirm-action.service';
import { TripFinancesExportService } from '@admin/services/trip-finances-export.service';
import {
  FILL_STANDARD_ROW_KEY,
  RESET_EXPENSES_ROW_KEY,
  createTripFinanceEntry,
  deleteTripFinanceEntry,
  fillStandardExpenses,
  loadTripFinances,
  resetExpenseAmounts,
  selectTripFinancesLoading,
  selectTripFinancesMutatingKey,
  tripFinancesSelectors,
  saveTripFinanceRow,
} from '@admin/features/trips/store/trip-finances';
import { TripFinancesSummaryComponent } from './trip-finances-summary/trip-finances-summary.component';
import {
  TripFinanceAutosave,
  TripFinancesTableComponent,
} from './trip-finances-table/trip-finances-table.component';
import {
  TripFinanceIncomeSave,
  TripFinancesIncomeTableComponent,
} from './trip-finances-income-table/trip-finances-income-table.component';
import { TripFinancesAddRowComponent } from './trip-finances-add-row/trip-finances-add-row.component';
import {
  buildIncomeRows,
  buildPresetRows,
  hasStandardLineOps,
  standardLineOps,
} from './trip-finance-rows.util';
import { EXPENSE_PRESETS, PAYMENT_PRESETS } from './trip-finance-presets.constants';
import {
  TRIP_FINANCES_ADD_MODES,
  TRIP_FINANCES_DEFAULT_TAB,
  TripFinancesTab,
} from './trip-finances.constants';

const EMPTY_SUMMARY: TripFinanceSummary = { incomeTotal: 0, expenseTotal: 0, profit: 0 };

/** Row key for the add bar, which has no row of its own to spin. */
const QUICK_ADD_KEY = 'quick-add';

/**
 * Expenses, incomes and payments for one trip. Rendered both inside the trip
 * details tabs and inside the standalone finances dialog opened from the card.
 *
 * Both hosts must keep it behind an `@if` that is false when the surface is
 * closed — the load is dispatched from `ngOnInit`, so a component kept alive
 * would never refetch when reopened for a different trip.
 */
@Component({
  selector: 'app-trip-finances',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, TranslocoModule, ButtonModule, TabsModule, LoadingSpinnerComponent,
    TripFinancesSummaryComponent, TripFinancesTableComponent,
    TripFinancesIncomeTableComponent, TripFinancesAddRowComponent,
  ],
  templateUrl: './trip-finances.component.html',
  styleUrl: './trip-finances.component.scss',
})
export class TripFinancesComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly confirm = inject(ConfirmActionService);
  private readonly transloco = inject(TranslocoService);
  private readonly exportService = inject(TripFinancesExportService);

  readonly tripId = input.required<string>();
  /** Route and date for the PDF header; the rows themselves come from the store. */
  readonly trip = input<Trip | null>(null);

  /** True while the two PDFs are being built — spins the export button. */
  readonly exporting = signal(false);

  readonly activeTab = signal<TripFinancesTab>(TRIP_FINANCES_DEFAULT_TAB);

  /** All three add bars render at once; only the active one is visible. */
  readonly addModes = TRIP_FINANCES_ADD_MODES;

  readonly loading = toSignal(this.store.select(selectTripFinancesLoading), { initialValue: false });
  readonly mutatingKey = toSignal(this.store.select(selectTripFinancesMutatingKey), { initialValue: null });

  // Selectors are keyed by trip id, so they can only be resolved once the input
  // has a value — hence the switchMap rather than a plain `store.select`.
  private readonly tripId$ = toObservable(this.tripId);

  private readonly expenses = toSignal(
    this.tripId$.pipe(switchMap((id) => this.store.select(tripFinancesSelectors(id).expenses))),
    { initialValue: [] as TripFinanceEntry[] }
  );
  private readonly incomes = toSignal(
    this.tripId$.pipe(switchMap((id) => this.store.select(tripFinancesSelectors(id).incomes))),
    { initialValue: [] as TripFinanceEntry[] }
  );
  private readonly payments = toSignal(
    this.tripId$.pipe(switchMap((id) => this.store.select(tripFinancesSelectors(id).payments))),
    { initialValue: [] as TripFinanceEntry[] }
  );
  readonly summary = toSignal(
    this.tripId$.pipe(switchMap((id) => this.store.select(tripFinancesSelectors(id).summary))),
    { initialValue: EMPTY_SUMMARY }
  );
  /** Shown under the payments table only — never folded into the profit tile. */
  readonly paymentsTotal = toSignal(
    this.tripId$.pipe(switchMap((id) => this.store.select(tripFinancesSelectors(id).paymentsTotal))),
    { initialValue: 0 }
  );
  /** What the adopters still owe — shown under the incomes table. */
  readonly incomeOutstanding = toSignal(
    this.tripId$.pipe(switchMap((id) => this.store.select(tripFinancesSelectors(id).incomeOutstanding))),
    { initialValue: 0 }
  );

  /**
   * Final budget — income − expenses − payments. Rounded through cents, the same
   * way the PDF's ΥΠΟΛΟΙΠΟ box is, so the tile and the printed sheet always agree.
   */
  readonly remaining = computed(() => {
    const { incomeTotal, expenseTotal } = this.summary();
    return Math.round((incomeTotal - expenseTotal - this.paymentsTotal()) * 100) / 100;
  });

  readonly expenseRows = computed((): TripFinanceRow[] =>
    buildPresetRows(this.expenses(), EXPENSE_PRESETS, 'expense')
  );
  readonly paymentRows = computed((): TripFinanceRow[] =>
    buildPresetRows(this.payments(), PAYMENT_PRESETS, 'payment')
  );
  /** Its own list — seeded per adopter by the server, then owned by the admin. */
  readonly incomeRows = computed((): TripFinanceIncomeRow[] => buildIncomeRows(this.incomes()));

  readonly quickAddPending = computed(() => this.mutatingKey() === QUICK_ADD_KEY);

  /** The standard lines with nothing recorded yet — missing, or zeroed by a reset. */
  private readonly pendingStandardLines = computed(() =>
    standardLineOps(this.expenseRows())
  );
  readonly canFillStandardLines = computed(() => hasStandardLineOps(this.pendingStandardLines()));
  readonly fillStandardPending = computed(() => this.mutatingKey() === FILL_STANDARD_ROW_KEY);

  /** Saved expenses carrying a non-zero amount — the only ones a reset would change. */
  private readonly resettableExpenseIds = computed(() =>
    this.expenses().filter((entry) => entry.amount !== 0).map((entry) => entry.id)
  );
  readonly canResetExpenses = computed(() => this.resettableExpenseIds().length > 0);
  readonly resetExpensesPending = computed(() => this.mutatingKey() === RESET_EXPENSES_ROW_KEY);

  private readonly table = viewChild(TripFinancesTableComponent);

  /** Drives the add bar; the shared table serves expenses and payments only. */
  readonly tableMode = computed((): TripFinanceEntryType => {
    switch (this.activeTab()) {
      case 'incomes': return 'income';
      case 'payments': return 'payment';
      default: return 'expense';
    }
  });

  /** Incomes have their own table, so this feeds the expenses/payments one. */
  readonly activeRows = computed((): TripFinanceRow[] =>
    this.activeTab() === 'payments' ? this.paymentRows() : this.expenseRows()
  );

  ngOnInit(): void {
    this.refresh();
  }

  /** Refetches every entry for the trip. Called on init and from the host's refresh button. */
  refresh(): void {
    this.store.dispatch(loadTripFinances({ tripId: this.tripId() }));
  }

  onTabChange(tab: string | undefined): void {
    // The table is shared across tabs, so an open inline edit would survive the
    // switch and keep pointing at a row the new tab doesn't render. Closing
    // flushes it first, so nothing typed just before the switch is lost.
    this.table()?.closeEdit();
    this.activeTab.set((tab as TripFinancesTab) ?? TRIP_FINANCES_DEFAULT_TAB);
  }

  /** Applies the standard price to every line that has one and nothing recorded. */
  onFillStandardLines(): void {
    const ops = this.pendingStandardLines();
    if (!hasStandardLineOps(ops)) return;
    this.store.dispatch(fillStandardExpenses({ tripId: this.tripId(), ops }));
  }

  /**
   * Zeroes every saved expense amount, keeping names, notes and custom lines.
   * Confirmed first: it rewrites the whole tab and the tiles with one click.
   */
  onResetExpenses(): void {
    const entryIds = this.resettableExpenseIds();
    if (!entryIds.length) return;
    this.confirm.confirm({
      header: this.transloco.translate('trips.finances.confirm.reset.header'),
      message: this.transloco.translate('trips.finances.confirm.reset.message', {
        count: entryIds.length,
      }),
      acceptLabel: this.transloco.translate('trips.finances.resetExpenses'),
      severity: 'danger',
      accept: () =>
        this.store.dispatch(resetExpenseAmounts({ tripId: this.tripId(), entryIds })),
    });
  }

  /**
   * Prints all three lists — expenses as one PDF, incomes + payments as the
   * other — from exactly the rows and totals on screen, whichever tab is open.
   */
  async onExportPdf(): Promise<void> {
    const trip = this.trip();
    if (!trip || this.exporting()) return;

    this.exporting.set(true);
    try {
      await this.exportService.exportFinancePdfs({
        trip,
        expenseRows: this.expenseRows(),
        incomeRows: this.incomeRows(),
        paymentRows: this.paymentRows(),
        summary: this.summary(),
        paymentsTotal: this.paymentsTotal(),
      });
    } catch (err) {
      // Same handling as the dogs manifest export: generation is client-side,
      // with no NgRx action to hang a toast on.
      console.error('[FinancesPdf] Failed to generate PDFs:', err);
    } finally {
      this.exporting.set(false);
    }
  }

  /** Adding a brand-new line from the bar; the table's own rows have real keys. */
  onQuickAdd(payload: TripFinanceEntryPayload): void {
    this.onCreate({ rowKey: QUICK_ADD_KEY, payload });
  }

  onCreate(event: { rowKey: string; payload: TripFinanceEntryPayload }): void {
    this.store.dispatch(
      createTripFinanceEntry({ tripId: this.tripId(), rowKey: event.rowKey, payload: event.payload })
    );
  }

  /** Inline autosave from the expenses/payments table. */
  onAutosave(event: TripFinanceAutosave): void {
    this.store.dispatch(
      saveTripFinanceRow({
        tripId: this.tripId(),
        rowKey: event.rowKey,
        entryId: event.entryId,
        payload: event.payload,
      })
    );
  }

  /** Autosave from the incomes ledger: the name, the total and the four methods. */
  onIncomeSave(event: TripFinanceIncomeSave): void {
    const { name, amount, note, paidCash, paidPaypal, paidRevolut, paidCredia } = event.changes;
    this.store.dispatch(
      saveTripFinanceRow({
        tripId: this.tripId(),
        rowKey: event.rowKey,
        entryId: event.entryId,
        payload: {
          type: 'income',
          name: name ?? '',
          amount: amount ?? 0,
          note,
          paidCash,
          paidPaypal,
          paidRevolut,
          paidCredia,
        },
      })
    );
  }

  /**
   * Confirmed, because it takes the payer off this trip's list along with
   * whatever was recorded against them. Their dogs are not touched.
   */
  onIncomeRemove(row: TripFinanceIncomeRow): void {
    this.confirm.confirm({
      header: this.transloco.translate('trips.finances.confirm.removePayer.header'),
      message: this.transloco.translate('trips.finances.confirm.removePayer.message', {
        name: row.name,
      }),
      acceptLabel: this.transloco.translate('common.delete'),
      severity: 'danger',
      accept: () =>
        this.store.dispatch(
          deleteTripFinanceEntry({
            tripId: this.tripId(),
            entryId: row.entry.id,
            rowKey: row.key,
          })
        ),
    });
  }

  onRemove(row: TripFinanceRow): void {
    if (!row.entry) return;
    this.store.dispatch(
      deleteTripFinanceEntry({ tripId: this.tripId(), entryId: row.entry.id, rowKey: row.key })
    );
  }
}
