import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarEvent } from '@models/lib/calendar-event.model';

@Component({
  selector: 'ui-trip-calendar',
  standalone: true,
  imports: [FormsModule, DatePickerModule, TooltipModule],
  templateUrl: './trip-calendar.component.html',
  styleUrls: ['./trip-calendar.component.scss'],
})
export class TripCalendarComponent implements OnChanges {
  @Input() events: CalendarEvent[] = [];
  @Input() selectedDate: string | null = null;
  @Output() dateSelected = new EventEmitter<string>();

  selectedDateObj: Date | null = null;
  minDate = new Date();
  private eventMap = new Map<string, string>();
  private eventDataMap = new Map<string, CalendarEvent>();

  ngOnChanges(): void {
    this.eventMap = new Map(this.events.map((e) => [e.date, e.color]));
    this.eventDataMap = new Map(this.events.map((e) => [e.date, e]));
    this.selectedDateObj = this.selectedDate ? new Date(this.selectedDate + 'T00:00:00') : null;
    // New reference forces p-datepicker (OnPush) to re-evaluate date-cell templates.
    this.minDate = new Date();
  }

  onSelect(date: Date): void {
    this.dateSelected.emit(this.toDateStr(date));
  }

  // p-calendar date template passes { year, month (0-based), day }
  hasEvent(date: { year: number; month: number; day: number }): boolean {
    return this.eventMap.has(this.partsToDateStr(date));
  }

  eventColor(date: { year: number; month: number; day: number }): string {
    return this.eventMap.get(this.partsToDateStr(date)) ?? '#e07b54';
  }

  getEventTooltip(date: { year: number; month: number; day: number }): string {
    const key = this.partsToDateStr(date);
    const event = this.eventDataMap.get(key);
    if (!event) return '';
    const lines: string[] = [event.title, event.date];
    if (event.dogsCount !== undefined && event.totalCapacity !== undefined) {
      lines.push(`Dogs: ${event.dogsCount} / ${event.totalCapacity}`);
    }
    if (event.isFull) {
      lines.push('Status: Full');
    } else if (event.acceptingRequests === false) {
      lines.push('Requests: Closed');
    } else {
      if (event.spotsAvailable !== undefined && event.spotsAvailable <= 2) {
        lines.push(`⚠ Only ${event.spotsAvailable} spot${event.spotsAvailable === 1 ? '' : 's'} remaining!`);
      } else {
        lines.push('Requests: Open');
      }
    }
    return lines.join('\n');
  }

  private partsToDateStr(d: { year: number; month: number; day: number }): string {
    return `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
  }

  private toDateStr(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
