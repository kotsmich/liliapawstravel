import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import {
  TripFinanceEntryPayload,
  TripFinanceEntryType,
} from '@models/lib/trip-finance.model';

/**
 * The add-a-line bar. Deliberately a sibling of the table rather than its
 * `tfoot`: a footer row tracks the end of the content, so on a short list it
 * would float in the middle of the dialog instead of sitting at the bottom.
 */
@Component({
  selector: 'app-trip-finances-add-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslocoModule, ButtonModule, InputTextModule, InputNumberModule],
  templateUrl: './trip-finances-add-row.component.html',
  styleUrl: './trip-finances-add-row.component.scss',
})
export class TripFinancesAddRowComponent {
  private readonly fb = inject(FormBuilder);

  readonly mode = input.required<TripFinanceEntryType>();
  readonly pending = input(false);

  readonly add = output<TripFinanceEntryPayload>();

  // Name is the only thing we insist on — the amount and the note are routinely
  // filled in later, so a blank amount is saved as 0 rather than blocking.
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    amount: [null as number | null, [Validators.min(0)]],
    note: ['', [Validators.maxLength(500)]],
  });

  readonly placeholderKey = computed(() => {
    switch (this.mode()) {
      case 'income': return 'trips.finances.addPayerPlaceholder';
      case 'payment': return 'trips.finances.addPaymentPlaceholder';
      default: return 'trips.finances.addExpensePlaceholder';
    }
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, amount, note } = this.form.getRawValue();
    this.add.emit({
      type: this.mode(),
      name: name!.trim(),
      amount: amount ?? 0,
      ...(note?.trim() ? { note: note.trim() } : {}),
    });
    this.form.reset({ name: '', amount: null, note: '' });
  }
}
