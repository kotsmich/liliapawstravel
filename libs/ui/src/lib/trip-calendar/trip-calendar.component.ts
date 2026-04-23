import { Component, Input, input, output, computed, ViewChild, AfterViewInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarEvent } from '@models/lib/calendar-event.model';

@Component({
  selector: 'ui-trip-calendar',
  standalone: true,
  imports: [FormsModule, DatePickerModule, TooltipModule],
  templateUrl: './trip-calendar.component.html',
  styleUrls: ['./trip-calendar.component.scss'],
})
export class TripCalendarComponent implements AfterViewInit {
  readonly events = input<CalendarEvent[]>([]);

  @ViewChild(DatePicker) private dp?: DatePicker;
  private _pendingNavigate: string | null = null;

  @Input() set navigateToDate(val: string | null) {
    this._pendingNavigate = val;
    this._doNavigate();
  }

  ngAfterViewInit(): void {
    this._doNavigate();
  }

  private _doNavigate(): void {
    if (!this._pendingNavigate || !this.dp) return;
    const d = new Date(this._pendingNavigate + 'T00:00:00');
    this.dp.currentMonth = d.getMonth();
    this.dp.currentYear = d.getFullYear();
    this.dp.createMonths(d.getMonth(), d.getFullYear());
    this._pendingNavigate = null;
  }

  @Input() set selectedDate(val: string | null) {
    this._confirmedDate = val ? new Date(val + 'T00:00:00') : null;
    this.selectedDateObj = this._confirmedDate ? new Date(this._confirmedDate.getTime()) : null;
  }

  readonly dateSelected = output<string>();
  readonly dateDblClicked = output<string>();

  private _confirmedDate: Date | null = null;
  selectedDateObj: Date | null = null;

  readonly minDate = new Date();

  readonly eventMap = computed(() =>
    new Map(this.events().map(e => [e.date, e.color]))
  );

  readonly tooltipMap = computed(() =>
    new Map(this.events().map(e => [e.date, this.buildTooltip(e)]))
  );

  dateKey(d: { year: number; month: number; day: number }): string {
    return `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
  }

  onSelect(date: Date): void {
    const candidate = this.toDateStr(date);
    // Always revert selectedDateObj so Angular CD calls writeValue on PrimeNG,
    // resetting its visual state. The parent confirms the selection via @Input().
    this.selectedDateObj = this._confirmedDate ? new Date(this._confirmedDate.getTime()) : null;
    this.dateSelected.emit(candidate);
  }

  onDblClick(date: { year: number; month: number; day: number }): void {
    this.dateDblClicked.emit(this.dateKey(date));
  }

  private buildTooltip(event: CalendarEvent): string {
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

  private spotsLabel(spots: number): string {
    if (spots >= 5) return 'Less than 10 spots left';
    if (spots > 3) return 'Less than 5 spots left';
    return `${spots} spot${spots === 1 ? '' : 's'} left`;
  }

  private toDateStr(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
