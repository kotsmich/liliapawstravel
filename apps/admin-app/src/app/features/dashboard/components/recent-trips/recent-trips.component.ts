import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { Trip } from '@models/lib/trip.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

@Component({
  selector: 'app-recent-trips',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CardModule, TagModule, ButtonModule, GenericTableComponent],
  templateUrl: './recent-trips.component.html',
  styles: [],
})
export class RecentTripsComponent implements AfterViewInit {
  @Input() trips: Trip[] = [];
  @Output() viewTrip = new EventEmitter<Trip>();
  @Output() navigateToAllTrips = new EventEmitter<void>();

  @ViewChild('routeTemplate') routeTemplate!: TemplateRef<unknown>;
  @ViewChild('dogsTemplate') dogsTemplate!: TemplateRef<unknown>;

  tableConfig: TableConfig = {
    trackByField: 'id',
    emptyMessage: 'No trips yet.',
    paginator: false,
  };

  columns: TableColumn<Trip>[] = [];

  actions: TableAction<Trip>[] = [
    {
      icon: 'pi pi-pencil',
      tooltip: 'View/Edit',
      severity: 'secondary',
      action: (trip) => this.viewTrip.emit(trip),
    },
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.columns = [
      { field: 'route', header: 'Route', type: 'template', template: this.routeTemplate },
      { field: 'date', header: 'Date' },
      { field: 'dogs', header: 'Dogs', type: 'template', template: this.dogsTemplate },
      {
        field: 'status', header: 'Status', type: 'badge',
        badgeConfig: {
          severity: (_, row) => {
            const trip = row as Trip;
            return trip.status === 'upcoming' ? 'info' : trip.status === 'completed' ? 'success' : 'secondary';
          },
          label: (_, row) => (row as Trip).status,
        },
      },
    ];
    this.cdr.markForCheck();
  }

  statusSeverity(status: Trip['status']): 'info' | 'success' | 'secondary' {
    return status === 'upcoming' ? 'info' : status === 'completed' ? 'success' : 'secondary';
  }
}
