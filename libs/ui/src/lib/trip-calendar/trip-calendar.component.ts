import { Component, Input, Output, EventEmitter } from '@angular/core';

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
export class TripCalendarComponent {
  @Input() set events(value: CalendarEvent[]) {
    this._events = value;
    this.eventMap = new Map(value.map((e) => [e.date, e.color]));
    this.eventDataMap = new Map(value.map((e) => [e.date, e]));
    // New reference forces p-datepicker (OnPush) to re-evaluate date-cell templates.
    this.minDate = new Date();
  }
  get events(): CalendarEvent[] { return this._events; }

  @Input() set selectedDate(value: string | null) {
    this._selectedDate = value;
    this.selectedDateObj = value ? new Date(value + 'T00:00:00') : null;
    this.minDate = new Date();
  }
  get selectedDate(): string | null { return this._selectedDate; }

  @Output() dateSelected = new EventEmitter<string>();
  @Output() dateDblClicked = new EventEmitter<string>();

  selectedDateObj: Date | null = null;
  minDate = new Date();
  private _events: CalendarEvent[] = [];
  private _selectedDate: string | null = null;
  private eventMap = new Map<string, string>();
  private eventDataMap = new Map<string, CalendarEvent>();

  onSelect(date: Date): void {
    this.dateSelected.emit(this.toDateStr(date));
  }

  onDblClick(date: { year: number; month: number; day: number }): void {
    this.dateDblClicked.emit(this.partsToDateStr(date));
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
    if (event.isFull) {
      lines.push('Status: Full');
    } else if (event.acceptingRequests === false) {
      lines.push('Requests: Closed');
    } else {
      const spots = event.spotsAvailable;
      if (spots !== undefined && spots < 10) {
        lines.push('⚠ ' + this.spotsLabel(spots));
      } else {
        if (event.dogsCount !== undefined && event.totalCapacity !== undefined && event.totalCapacity > 0) {
          lines.push(`${Math.round((event.dogsCount / event.totalCapacity) * 100)}% booked`);
        }
        lines.push('Requests: Open');
      }
    }
    return lines.join('\n');
  }

  spotsLabel(spots: number): string {
    if (spots >= 5) return 'Less than 10 spots left';
    if (spots > 3) return 'Less than 5 spots left';
    return `${spots} spot${spots === 1 ? '' : 's'} left`;
  }

  private partsToDateStr(d: { year: number; month: number; day: number }): string {
    return `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
  }

  private toDateStr(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
