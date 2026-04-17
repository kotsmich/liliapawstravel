import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { LocalDatePipe } from '@ui/lib/pipes/local-date.pipe';
import { ButtonModule } from 'primeng/button';
import { TripCalendarComponent } from '@ui/lib/trip-calendar/trip-calendar.component';
import { Trip } from '@models/lib/trip.model';
import { CalendarEvent } from '@models/lib/calendar-event.model';
import { TripCalendarCardComponent } from './trip-calendar-card/trip-calendar-card.component';

@Component({
  selector: 'app-trip-calendar-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, ButtonModule, TripCalendarComponent, LocalDatePipe, TranslocoModule, TripCalendarCardComponent],
  templateUrl: './trip-calendar-view.component.html',
  styleUrls: ['./trip-calendar-view.component.scss'],
})
export class TripCalendarViewComponent {
  readonly trips = input<Trip[]>([]);
  readonly selectedDate = input<string | null>(null);
  readonly calendarEvents = input<CalendarEvent[]>([]);
  readonly tripsForDate = input<Trip[]>([]);
  readonly dateSelected = output<string>();
  readonly addTripClicked = output<void>();
  readonly editTrip = output<Trip>();
  readonly deleteTrip = output<Trip>();
  readonly viewDetails = output<Trip>();
  readonly exportPdf = output<Trip>();

  trackByTripId(_: number, trip: Trip): string { return trip.id; }

  onDateDblClicked(dateStr: string): void {
    const trip = this.trips().find((trip) => trip.date === dateStr);
    if (trip) this.editTrip.emit(trip);
  }

}
