import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TripCalendarComponent } from '@ui/lib/trip-calendar/trip-calendar.component';
import { LocalDatePipe } from '@ui/lib/pipes/local-date.pipe';
import { Trip } from '@models/lib/trip.model';
import { CalendarEvent } from '@models/lib/calendar-event.model';

@Component({
  selector: 'app-trip-calendar-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, ButtonModule, TagModule, TripCalendarComponent, LocalDatePipe, TranslocoModule],
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
    const trip = this.trips().find((t) => t.date === dateStr);
    if (trip) this.editTrip.emit(trip);
  }

  statusSeverity(status: Trip['status']): 'info' | 'success' | 'secondary' {
    return status === 'upcoming' ? 'info' : status === 'completed' ? 'success' : 'secondary';
  }
}
