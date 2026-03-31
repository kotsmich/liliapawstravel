import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Trip } from '@models/lib/trip.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

@Component({
  selector: 'app-recent-trips',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CardModule, ButtonModule, GenericTableComponent],
  templateUrl: './recent-trips.component.html',
  styles: [`:host ::ng-deep .table-scroll { overflow-x: auto; }`],
})
export class RecentTripsComponent {
  @Input() trips: Trip[] = [];
  @Output() viewTrip = new EventEmitter<Trip>();
  @Output() navigateToAllTrips = new EventEmitter<void>();

  tableConfig: TableConfig = {
    trackByField: 'id',
    emptyMessage: 'No trips yet.',
    paginator: false,
  };

  columns: TableColumn<Trip>[] = [
    {
      field: 'route',
      header: 'Route',
      formatter: (_, row) => {
        const t = row as Trip;
        return `${t.departureCity}, ${t.departureCountry} → ${t.arrivalCity}, ${t.arrivalCountry}`;
      },
    },
    { field: 'date', header: 'Date' },
    {
      field: 'dogs',
      header: 'Dogs',
      formatter: (_, row) => String((row as Trip).dogs?.length ?? 0),
    },
    {
      field: 'status',
      header: 'Status',
      type: 'badge',
      badgeConfig: {
        severity: (_, row) => {
          const trip = row as Trip;
          return trip.status === 'upcoming' ? 'info' : trip.status === 'completed' ? 'success' : 'secondary';
        },
        label: (_, row) => (row as Trip).status,
      },
    },
  ];

  actions: TableAction<Trip>[] = [
    {
      icon: 'pi pi-pencil',
      tooltip: 'View/Edit',
      severity: 'secondary',
      action: (trip) => this.viewTrip.emit(trip),
    },
  ];
}
