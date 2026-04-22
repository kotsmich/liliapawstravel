import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { Trip } from '@models/lib/trip.model';
import { LocalDatePipe } from '@ui/lib/pipes/local-date.pipe';

@Component({
  selector: 'app-trip-details-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, TranslocoModule, LocalDatePipe],
  templateUrl: './trip-details-card.component.html',
  styleUrls: ['./trip-details-card.component.scss'],
})
export class TripDetailsCardComponent {
  @Input({ required: true }) trip!: Trip;
}
