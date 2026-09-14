import { ChangeDetectionStrategy, Component, computed, inject, input, viewChild } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { Trip } from '@models/lib/trip.model';
import { DetailDialogBase } from '@admin/shared/components/detail-dialog-base';
import { LoadingSpinnerComponent } from '@ui/lib/loading-spinner/loading-spinner.component';
import { LocalDatePipe } from '@ui/lib/pipes/local-date.pipe';
import { TripFinancesComponent } from '../trip-finances/trip-finances.component';

/**
 * Finances-only surface opened from the trip calendar card. Deliberately does
 * not provide the DogManagerService stack that the full detail dialog carries.
 */
@Component({
  selector: 'app-trip-finances-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslocoModule, ButtonModule, DialogModule, TooltipModule,
    LoadingSpinnerComponent, TripFinancesComponent,
  ],
  providers: [LocalDatePipe],
  templateUrl: './trip-finances-dialog.component.html',
  styleUrl: './trip-finances-dialog.component.scss',
})
export class TripFinancesDialogComponent extends DetailDialogBase {
  private readonly localDate = inject(LocalDatePipe);

  readonly trip = input<Trip | null>(null);
  readonly loading = input(false);

  // `header` is taken by the <ng-template #header> PrimeNG queries for.
  readonly headerText = computed(() => {
    const trip = this.trip();
    if (!trip) return '';
    return `${trip.departureCity} → ${trip.arrivalCity} (${this.localDate.transform(trip.date)})`;
  });

  private readonly finances = viewChild(TripFinancesComponent);

  /** Spins the header button while the panel refetches. */
  readonly refreshing = computed(() => this.finances()?.loading() ?? false);

  refresh(): void {
    this.finances()?.refresh();
  }
}
