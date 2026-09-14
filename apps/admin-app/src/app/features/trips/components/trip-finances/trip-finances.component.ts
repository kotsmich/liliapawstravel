import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { switchMap } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { TabsModule } from 'primeng/tabs';
import { LoadingSpinnerComponent } from '@ui/lib/loading-spinner/loading-spinner.component';
import {
  TripFinanceEntry,
  TripFinanceEntryChanges,
  TripFinanceEntryPayload,
  TripFinanceEntryType,
  TripFinanceRow,
  TripFinanceSummary,
} from '@models/lib/trip-finance.model';
import { TripRequester } from '@models/lib/trip.model';
import {
  createTripFinanceEntry,
  deleteTripFinanceEntry,
  loadTripFinances,
  selectTripFinancesLoading,
  selectTripFinancesMutatingKey,
  tripFinancesSelectors,
  updateTripFinanceEntry,
} from '@admin/features/trips/store/trip-finances';
import { TripFinancesSummaryComponent } from './trip-finances-summary/trip-finances-summary.component';
import { TripFinancesTableComponent } from './trip-finances-table/trip-finances-table.component';
import { TripFinancesAddRowComponent } from './trip-finances-add-row/trip-finances-add-row.component';
import { buildExpenseRows, buildFlatRows, buildIncomeRows } from './trip-finance-rows.util';
import { EXPENSE_PRESETS } from './trip-finance-presets.constants';
import { TRIP_FINANCES_DEFAULT_TAB, TripFinancesTab } from './trip-finances.constants';

const EMPTY_SUMMARY: TripFinanceSummary = { incomeTotal: 0, expenseTotal: 0, profit: 0 };

/** Row key for the add bar, which has no row of its own to spin. */
const QUICK_ADD_KEY = 'quick-add';

/**
 * Expenses + incomes for one trip. Rendered both inside the trip details tabs
 * and inside the standalone finances dialog opened from the calendar card.
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
    CurrencyPipe, TranslocoModule, TabsModule, LoadingSpinnerComponent,
    TripFinancesSummaryComponent, TripFinancesTableComponent, TripFinancesAddRowComponent,
  ],
  templateUrl: './trip-finances.component.html',
  styleUrl: './trip-finances.component.scss',
})
export class TripFinancesComponent implements OnInit {
  private readonly store = inject(Store);

  readonly tripId = input.required<string>();
  readonly requesters = input<TripRequester[]>([]);

  readonly activeTab = signal<TripFinancesTab>(TRIP_FINANCES_DEFAULT_TAB);

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

  readonly expenseRows = computed((): TripFinanceRow[] =>
    buildExpenseRows(this.expenses(), EXPENSE_PRESETS)
  );
  readonly paymentRows = computed((): TripFinanceRow[] => buildFlatRows(this.payments()));
  readonly incomeRows = computed((): TripFinanceRow[] =>
    buildIncomeRows(this.incomes(), this.requesters())
  );

  readonly quickAddPending = computed(() => this.mutatingKey() === QUICK_ADD_KEY);

  /** One table and one add-row serve all three tabs; only the data differs. */
  readonly tableMode = computed((): TripFinanceEntryType => {
    switch (this.activeTab()) {
      case 'incomes': return 'income';
      case 'payments': return 'payment';
      default: return 'expense';
    }
  });

  readonly activeRows = computed((): TripFinanceRow[] => {
    switch (this.activeTab()) {
      case 'incomes': return this.incomeRows();
      case 'payments': return this.paymentRows();
      default: return this.expenseRows();
    }
  });

  ngOnInit(): void {
    this.store.dispatch(loadTripFinances({ tripId: this.tripId() }));
  }

  onTabChange(tab: string | undefined): void {
    this.activeTab.set((tab as TripFinancesTab) ?? TRIP_FINANCES_DEFAULT_TAB);
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

  onUpdate(event: { entryId: string; rowKey: string; changes: TripFinanceEntryChanges }): void {
    this.store.dispatch(
      updateTripFinanceEntry({
        tripId: this.tripId(),
        entryId: event.entryId,
        rowKey: event.rowKey,
        changes: event.changes,
      })
    );
  }

  onRemove(row: TripFinanceRow): void {
    if (!row.entry) return;
    this.store.dispatch(
      deleteTripFinanceEntry({ tripId: this.tripId(), entryId: row.entry.id, rowKey: row.key })
    );
  }
}
