import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-trip-finances-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, TranslocoModule],
  templateUrl: './trip-finances-summary.component.html',
  styleUrl: './trip-finances-summary.component.scss',
})
export class TripFinancesSummaryComponent {
  readonly incomeTotal = input.required<number>();
  readonly expenseTotal = input.required<number>();
  readonly profit = input.required<number>();
  /** Income − expenses − payments: what's actually left once everything is paid out. */
  readonly remaining = input.required<number>();
}
