import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import {
  TRIP_FINANCE_METHODS,
  TripFinanceEntryChanges,
  TripFinanceIncomeRow,
  TripFinanceMethod,
} from '@models/lib/trip-finance.model';

/** How long typing has to pause before a row is saved. */
const AUTOSAVE_DEBOUNCE_MS = 500;

export interface TripFinanceIncomeSave {
  rowKey: string;
  entryId: string;
  changes: TripFinanceEntryChanges;
}

const cents = (value: unknown): number => Math.round((Number(value) || 0) * 100);

/**
 * The incomes tab: one row per payer, with what they owe and how much of it
 * arrived by each method.
 *
 * Unlike the expenses and payments table, every cell is an input at once —
 * this reads as a ledger the admin fills in, not a list of rows to open one by
 * one. Each row owns a form group, kept in a Map so it survives the rows being
 * rebuilt after every save; without that the cursor would jump on each keystroke.
 */
@Component({
  selector: 'app-trip-finances-income-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, ReactiveFormsModule, TranslocoModule,
    ButtonModule, InputTextModule, InputNumberModule, TableModule, TooltipModule,
  ],
  templateUrl: './trip-finances-income-table.component.html',
  styleUrl: './trip-finances-income-table.component.scss',
})
export class TripFinancesIncomeTableComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = input<TripFinanceIncomeRow[]>([]);
  readonly mutatingKey = input<string | null>(null);

  readonly save = output<TripFinanceIncomeSave>();
  readonly remove = output<TripFinanceIncomeRow>();

  private readonly groups = new Map<string, FormGroup>();
  /** What each row last sent, so identical values are never re-sent. */
  private readonly lastSent = new Map<string, string>();

  readonly trackByKey = (_index: number, row: TripFinanceIncomeRow): string => row.key;

  /**
   * The row's form, created on first render and reused after that. A row whose
   * inputs are untouched takes the server's values; one being edited keeps what
   * the admin typed.
   */
  groupFor(row: TripFinanceIncomeRow): FormGroup {
    const existing = this.groups.get(row.key);
    if (existing) {
      if (existing.pristine) this.applyServerValues(existing, row);
      return existing;
    }

    // No cross-field validator: a row must always be saveable. "You can't pay
    // more than the total" is enforced on the method inputs instead (see
    // `maxFor`), so lowering or clearing the total never blocks the save.
    const group = this.fb.group({
      name: [row.name, [Validators.required, Validators.maxLength(120)]],
      amount: [row.total as number | null, [Validators.min(0)]],
      paidCash: [row.entry.paidCash as number | null, [Validators.min(0)]],
      paidPaypal: [row.entry.paidPaypal as number | null, [Validators.min(0)]],
      paidRevolut: [row.entry.paidRevolut as number | null, [Validators.min(0)]],
      paidCredia: [row.entry.paidCredia as number | null, [Validators.min(0)]],
    });

    group.valueChanges
      .pipe(debounceTime(AUTOSAVE_DEBOUNCE_MS), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.flush(row.key));

    this.groups.set(row.key, group);
    return group;
  }

  /** Saves the row if it has changed. Called on pause and on blur. */
  flush(rowKey: string): void {
    const group = this.groups.get(rowKey);
    const row = this.rows().find((candidate) => candidate.key === rowKey);
    if (!group || !row || group.pristine) return;
    if (group.invalid) {
      // Only a missing or over-long name can get here; the amounts are free to
      // be anything, including cleared.
      group.markAllAsTouched();
      return;
    }

    const raw = group.getRawValue() as Record<string, unknown>;
    const changes: TripFinanceEntryChanges = {
      name: String(raw['name'] ?? '').trim(),
      amount: Number(raw['amount']) || 0,
      paidCash: Number(raw['paidCash']) || 0,
      paidPaypal: Number(raw['paidPaypal']) || 0,
      paidRevolut: Number(raw['paidRevolut']) || 0,
      paidCredia: Number(raw['paidCredia']) || 0,
      // This tab has no note column, but the store sends every field on update —
      // so the existing note rides along rather than being cleared.
      note: row.entry.note ?? '',
    };

    const snapshot = JSON.stringify(changes);
    if (snapshot === this.lastSent.get(rowKey)) return;
    this.lastSent.set(rowKey, snapshot);

    // Pristine again, so the server's echo can flow back into the inputs — and
    // so can a change made in another session.
    group.markAsPristine();
    this.save.emit({ rowKey, entryId: row.entry.id, changes });
  }

  /** total − paid, live from the inputs rather than from the last saved row. */
  remainingOf(group: FormGroup): number {
    const value = group.value as Record<string, unknown>;
    return (cents(value['amount']) - this.paidCents(value)) / 100;
  }

  /**
   * What this method may still take: the total minus the other three. Handed to
   * the input as its `max`, which is what stops the admin entering more than
   * the total — without ever making the row unsaveable.
   */
  maxFor(group: FormGroup, field: TripFinanceMethod): number {
    const value = group.value as Record<string, unknown>;
    const others = TRIP_FINANCE_METHODS.filter((method) => method !== field).reduce(
      (sum, method) => sum + cents(value[method]),
      0
    );
    return Math.max(0, (cents(value['amount']) - others) / 100);
  }

  /**
   * Over-collected — only reachable by lowering the total below what has already
   * been recorded. The row still saves; the red figure is the prompt to fix it.
   */
  isOverpaid(group: FormGroup): boolean {
    return this.remainingOf(group) < 0;
  }

  onDelete(row: TripFinanceIncomeRow): void {
    this.groups.delete(row.key);
    this.lastSent.delete(row.key);
    this.remove.emit(row);
  }

  private paidCents(value: Record<string, unknown>): number {
    return TRIP_FINANCE_METHODS.reduce((sum, method) => sum + cents(value[method]), 0);
  }

  private applyServerValues(group: FormGroup, row: TripFinanceIncomeRow): void {
    const next = {
      name: row.name,
      amount: row.total,
      paidCash: row.entry.paidCash,
      paidPaypal: row.entry.paidPaypal,
      paidRevolut: row.entry.paidRevolut,
      paidCredia: row.entry.paidCredia,
    };
    // Only when something actually differs: patching unconditionally during
    // render would churn the inputs on every change detection pass.
    if (JSON.stringify(group.getRawValue()) === JSON.stringify(next)) return;
    group.setValue(next, { emitEvent: false });
  }
}
