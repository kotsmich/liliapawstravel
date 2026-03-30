import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TripCalendarComponent } from '@ui/lib/trip-calendar/trip-calendar.component';
import { Trip } from '@models/lib/trip.model';
import { CalendarEvent } from '@models/lib/calendar-event.model';

@Component({
  selector: 'app-trip-calendar-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, ButtonModule, TagModule, TripCalendarComponent],
  templateUrl: './trip-calendar-view.component.html',
  styleUrls: ['./trip-calendar-view.component.scss'],
})
export class TripCalendarViewComponent {
  @Input() trips: Trip[] = [];
  @Input() selectedDate: string | null = null;
  @Input() calendarEvents: CalendarEvent[] = [];
  @Input() tripsForDate: Trip[] = [];
  @Output() dateSelected = new EventEmitter<string>();
  @Output() addTripClicked = new EventEmitter<void>();
  @Output() editTrip = new EventEmitter<Trip>();
  @Output() deleteTrip = new EventEmitter<Trip>();
  @Output() viewDetails = new EventEmitter<Trip>();

  trackByTripId(_: number, trip: Trip): string { return trip.id; }

  fmtDate(date: string): string {
    if (!date) return '—';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }

  statusSeverity(status: Trip['status']): 'info' | 'success' | 'secondary' {
    return status === 'upcoming' ? 'info' : status === 'completed' ? 'success' : 'secondary';
  }
}
