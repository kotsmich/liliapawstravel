import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import {
  TripFinanceEntryChanges,
  TripFinanceEntryPayload,
  TripFinanceEntryType,
  TripFinanceRow,
} from '@models/lib/trip-finance.model';

/**
 * Inline-editable money table, shared by all three finance tabs.
 *
 * Built on a raw `p-table` rather than `GenericTableComponent`, which has no
 * cell editing and a row-level click handler that would fire every time the
 * admin clicks into an input. Adding new lines is a sibling component.
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

  readonly create = output<{ rowKey: string; payload: TripFinanceEntryPayload }>();
  readonly update = output<{ entryId: string; rowKey: string; changes: TripFinanceEntryChanges }>();
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

  /** The orphan block gets its own divider row; everything above it is normal. */
  readonly firstOrphanKey = computed(
    () => this.rows().find((row) => row.orphaned)?.key ?? null
  );

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
    this.editForm.reset({
      name: row.displayName,
      // A standard line with nothing recorded — unsaved, or left at 0 by a
      // reset — opens at its usual price, so accepting it is one keystroke.
      // Anything with a real amount opens at what was actually recorded.
      amount: row.suggestedAmount ?? row.amount,
      note: row.note ?? '',
    });
    if (this.isNameLocked(row)) {
      this.editForm.controls.name.disable();
    } else {
      this.editForm.controls.name.enable();
    }
    this.editingKey.set(row.key);
  }

  cancelEdit(): void {
    this.editingKey.set(null);
  }

  commitEdit(row: TripFinanceRow): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    // getRawValue, not value — a locked payer name is disabled and would be dropped.
    const { name, amount, note } = this.editForm.getRawValue();

    if (row.entry) {
      this.update.emit({
        entryId: row.entry.id,
        rowKey: row.key,
        changes: { name: name!, amount: amount ?? 0, note: note?.trim() ?? '' },
      });
    } else {
      // An unsaved requestor suggestion becoming a real income row.
      this.create.emit({
        rowKey: row.key,
        payload: {
          type: this.mode(),
          name: name!,
          amount: amount ?? 0,
          ...(note?.trim() ? { note: note.trim() } : {}),
          ...(row.requesterId ? { requesterId: row.requesterId } : {}),
        },
      });
    }
    this.editingKey.set(null);
  }

  onDelete(row: TripFinanceRow): void {
    if (!row.entry) return;
    if (this.editingKey() === row.key) this.editingKey.set(null);
    this.remove.emit(row);
  }
}
