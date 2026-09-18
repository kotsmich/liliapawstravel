import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import {
  TripFinanceEntryPayload,
  TripFinanceEntryType,
  TripFinanceRow,
} from '@models/lib/trip-finance.model';

/** How long typing has to pause before the open row is saved. */
const AUTOSAVE_DEBOUNCE_MS = 500;

export interface TripFinanceAutosave {
  rowKey: string;
  /** null for a slot with nothing saved yet — the store creates it once, then updates. */
  entryId: string | null;
  payload: TripFinanceEntryPayload;
}

/**
 * Inline-editable money table, shared by all three finance tabs.
 *
 * Built on a raw `p-table` rather than `GenericTableComponent`, which has no
 * cell editing and a row-level click handler that would fire every time the
 * admin clicks into an input. Adding new lines is a sibling component.
 *
 * Edits autosave: after a pause in typing, on leaving a field, on Enter, and
 * when the row is closed or another row opened. There is no confirm button.
 */
@Component({
  selector: 'app-trip-finances-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, ReactiveFormsModule, TranslocoModule,
    ButtonModule, InputTextModule, InputNumberModule, TableModule, TooltipModule,
  ],
  templateUrl: './trip-finances-table.component.html',
  styleUrl: './trip-finances-table.component.scss',
})
export class TripFinancesTableComponent {
  private readonly fb = inject(FormBuilder);

  readonly mode = input.required<TripFinanceEntryType>();
  readonly rows = input<TripFinanceRow[]>([]);
  readonly mutatingKey = input<string | null>(null);

  readonly autosave = output<TripFinanceAutosave>();
  readonly remove = output<TripFinanceRow>();

  readonly editingKey = signal<string | null>(null);

  readonly nameHeaderKey = computed(() => {
    switch (this.mode()) {
      case 'income': return 'trips.finances.payer';
      case 'payment': return 'trips.finances.paidTo';
      default: return 'trips.finances.name';
    }
  });

  readonly emptyMessageKey = computed(() => {
    switch (this.mode()) {
      case 'income': return 'trips.finances.noIncomes';
      case 'payment': return 'trips.finances.noPayments';
      default: return 'trips.finances.noExpenses';
    }
  });

  readonly editForm = this.buildForm();

  /** The open row's last sent (or loaded) values, so identical values are never re-sent. */
  private lastSentSnapshot: string | null = null;

  /**
   * Rows are rebuilt from the store after every save. Tracking by the stable
   * slot key keeps the open row's DOM — and the cursor inside it — alive across
   * that; PrimeNG's default tracks by object identity and would redraw it.
   */
  readonly trackByKey = (_index: number, row: TripFinanceRow): string => row.key;

  /** The orphan block gets its own divider row; everything above it is normal. */
  readonly firstOrphanKey = computed(
    () => this.rows().find((row) => row.orphaned)?.key ?? null
  );

  constructor() {
    this.editForm.valueChanges
      .pipe(debounceTime(AUTOSAVE_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe(() => this.flushAutosave());
  }

  // Only the name is mandatory here too; clearing the amount means 0, not a
  // blocked save. See the add-row component for the same rule.
  private buildForm() {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      amount: [null as number | null, [Validators.min(0)]],
      note: ['', [Validators.maxLength(500)]],
    });
  }

  /** A requestor-linked income keeps its payer identity — only orphans and custom payers rename. */
  private isNameLocked(row: TripFinanceRow): boolean {
    return this.mode() === 'income' && row.requesterId !== null && !row.orphaned;
  }

  startEdit(row: TripFinanceRow): void {
    if (this.editingKey() === row.key) return;
    // Leaving another row mid-type must not drop its last keystrokes.
    this.flushAutosave();

    // emitEvent: false — loading a row into the form is not an edit, and must
    // neither trigger the debounce nor count as a change.
    this.editForm.reset(
      {
        name: row.displayName,
        // A standard line with nothing recorded — unsaved, or left at 0 by a
        // reset — opens at its usual price, so accepting it is one keystroke.
        // Anything with a real amount opens at what was actually recorded.
        amount: row.suggestedAmount ?? row.amount,
        note: row.note ?? '',
      },
      { emitEvent: false }
    );
    const name = this.editForm.controls.name;
    if (this.isNameLocked(row)) {
      name.disable({ emitEvent: false });
    } else {
      name.enable({ emitEvent: false });
    }

    // A saved row starts from what is persisted — not from the suggestion shown
    // in the form. An unsaved slot has nothing persisted at all.
    this.lastSentSnapshot = row.entry
      ? this.snapshot(row.displayName, row.amount ?? 0, row.note ?? '')
      : null;
    this.editingKey.set(row.key);
  }

  /**
   * Saves whatever is in the open row, if it needs saving.
   *
   * An untouched row never saves: merely opening an unsaved standard line must
   * not create money nobody entered. `force` is for Enter, which is an explicit
   * "accept" — it saves a pre-filled suggestion even though nothing was typed.
   */
  flushAutosave(force = false): void {
    const key = this.editingKey();
    if (!key) return;
    if (!force && !this.editForm.dirty) return;
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const row = this.rows().find((candidate) => candidate.key === key);
    if (!row) return;

    // getRawValue, not value — a locked payer name is disabled and would be dropped.
    const raw = this.editForm.getRawValue();
    const name = (raw.name ?? '').trim();
    const amount = raw.amount ?? 0;
    const note = (raw.note ?? '').trim();

    const snapshot = this.snapshot(name, amount, note);
    if (snapshot === this.lastSentSnapshot) return;
    this.lastSentSnapshot = snapshot;

    this.autosave.emit({
      rowKey: row.key,
      entryId: row.entry?.id ?? null,
      payload: {
        type: this.mode(),
        name,
        amount,
        ...(note ? { note } : {}),
        ...(row.requesterId ? { requesterId: row.requesterId } : {}),
      },
    });
  }

  /** Enter: save now (accepting any suggestion shown) and close the row. */
  commitEdit(): void {
    this.flushAutosave(true);
    if (this.editForm.valid) this.editingKey.set(null);
  }

  /**
   * Close the row, saving anything typed. There is no discard — by the time the
   * admin reaches for close, their typing has already been saved.
   */
  closeEdit(): void {
    this.flushAutosave();
    this.editingKey.set(null);
  }

  onDelete(row: TripFinanceRow): void {
    if (!row.entry) return;
    // No flush: the row is going away, so saving it first would be wasted work.
    if (this.editingKey() === row.key) this.editingKey.set(null);
    this.remove.emit(row);
  }

  private snapshot(name: string, amount: number, note: string): string {
    return JSON.stringify([name, amount, note]);
  }
}
