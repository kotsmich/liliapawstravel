import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';
import { LocalDatePipe } from '@ui/lib/pipes/local-date.pipe';
import { Trip } from '@models/lib/trip.model';
import { TripStatusBadgesComponent } from '@admin/shared/components/trip-status-badges/trip-status-badges.component';

@Component({
  selector: 'app-trip-calendar-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, ButtonModule, TranslocoModule, LocalDatePipe, TripStatusBadgesComponent],
  templateUrl: './trip-calendar-card.component.html',
  styleUrl: './trip-calendar-card.component.scss',
})
export class TripCalendarCardComponent {
  readonly trip = input.required<Trip>();
  readonly viewDetails = output<Trip>();
  readonly edit = output<Trip>();
  readonly exportPdf = output<Trip>();
  readonly delete = output<Trip>();
}
