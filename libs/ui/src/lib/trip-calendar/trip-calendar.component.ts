import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { CalendarEvent } from '@myorg/models';

interface CalendarCell {
  date: string;
  label: number;
  hasEvent: boolean;
  isPast: boolean;
  color: string;
}

@Component({
  selector: 'ui-trip-calendar',
  standalone: true,
  imports: [CommonModule, TooltipModule, TagModule],
  templateUrl: './trip-calendar.component.html',
  styleUrls: ['./trip-calendar.component.scss'],
})
export class TripCalendarComponent implements OnChanges {
  @Input() events: CalendarEvent[] = [];
  @Input() selectedDate: string | null = null;
  @Output() dateSelected = new EventEmitter<string>();

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthLabel = '';
  grid: CalendarCell[] = [];
  currentYear = 0;
  currentMonth = 0;

  ngOnChanges(): void {
    this.buildGrid();
  }

  buildGrid(): void {
    const now = new Date();
    if (!this.currentYear) {
      this.currentYear = now.getFullYear();
      this.currentMonth = now.getMonth();
    }
    this.monthLabel = new Date(this.currentYear, this.currentMonth, 1)
      .toLocaleString('default', { month: 'long', year: 'numeric' });

    const eventMap = new Map(this.events.map((e) => [e.date, e.color]));
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.grid = [];
    for (let i = 0; i < firstDay; i++) {
      this.grid.push({ date: '', label: 0, hasEvent: false, isPast: false, color: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      this.grid.push({
        date: dateStr,
        label: d,
        hasEvent: eventMap.has(dateStr),
        isPast: new Date(dateStr) < today,
        color: eventMap.get(dateStr) ?? '',
      });
    }
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.buildGrid();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.buildGrid();
  }

  select(cell: CalendarCell): void {
    if (!cell.date || cell.isPast) return;
    this.dateSelected.emit(cell.date);
  }
}
