import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TripRequest } from '@models/lib/trip-request.model';
import { Trip } from '@models/lib/trip.model';
import { TableColumn, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

type RequestDog = TripRequest['dogs'][number];

@Component({
  selector: 'app-request-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, DialogModule, ButtonModule, TagModule, TextareaModule, GenericTableComponent],
  templateUrl: './request-detail-dialog.component.html',
  styles: [],
})
export class RequestDetailDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() request: TripRequest | null = null;
  @Input() trips: Trip[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() approve = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();
  @Output() deleteRequest = new EventEmitter<TripRequest>();
  @Output() cancel = new EventEmitter<void>();
  @Output() saveNote = new EventEmitter<string>();

  noteText = '';

  ngOnChanges(): void {
    if (this.request) {
      this.noteText = this.request.adminNote ?? '';
    }
  }

  dogColumns: TableColumn<RequestDog>[] = [
    { field: 'name', header: 'Name' },
    { field: 'size', header: 'Size' },
    { field: 'age', header: 'Age', formatter: (val) => `${val} yr` },
    { field: 'chipId', header: 'Chip ID' },
    { field: 'pickupLocation', header: 'Pickup' },
    { field: 'dropLocation', header: 'Drop' },
  ];

  dogConfig: TableConfig = { paginator: false, emptyMessage: 'No dogs.', trackByField: 'id' };

  statusSeverity(status: TripRequest['status']): 'warn' | 'success' | 'danger' | 'secondary' {
    if (status === 'pending') return 'warn';
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'secondary';
  }

  fmtDate(date: string): string {
    if (!date) return '—';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }

  tripDate(tripId: string | undefined): string {
    if (!tripId) return '—';
    const trip = this.trips.find((t) => t.id === tripId);
    return trip ? this.fmtDate(trip.date) : tripId;
  }
}
