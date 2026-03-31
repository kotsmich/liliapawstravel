import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Trip } from '@models/lib/trip.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

@Component({
  selector: 'app-all-trips-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TagModule, ButtonModule, TooltipModule, GenericTableComponent],
  templateUrl: './all-trips-tab.component.html',
  styleUrls: ['./all-trips-tab.component.scss'],
})
export class AllTripsTabComponent implements AfterViewInit {
  @Input() trips: Trip[] = [];
  @Output() editTrip = new EventEmitter<Trip>();
  @Output() deleteTrip = new EventEmitter<Trip>();
  @Output() viewDetails = new EventEmitter<Trip>();

  @ViewChild('routeTemplate') routeTemplate!: TemplateRef<unknown>;
  @ViewChild('dogsCountTemplate') dogsCountTemplate!: TemplateRef<unknown>;
  @ViewChild('remainingTemplate') remainingTemplate!: TemplateRef<unknown>;
  @ViewChild('acceptingTemplate') acceptingTemplate!: TemplateRef<unknown>;

  tableConfig: TableConfig = {
    trackByField: 'id',
    emptyMessage: 'No trips yet.',
    paginator: false,
  };

  columns: TableColumn<Trip>[] = [];

  actions: TableAction<Trip>[] = [
    {
      icon: 'pi pi-pencil',
      tooltip: 'Edit',
      severity: 'secondary',
      action: (trip) => this.editTrip.emit(trip),
    },
    {
      icon: 'pi pi-trash',
      tooltip: 'Delete',
      severity: 'danger',
      action: (trip) => this.deleteTrip.emit(trip),
    },
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.columns = [
      { field: 'date', header: 'Date', sortable: true },
      { field: 'route', header: 'Route', type: 'template', template: this.routeTemplate },
      { field: 'totalCapacity', header: 'Capacity', sortable: true },
      { field: 'dogsCount', header: 'Filled', type: 'template', template: this.dogsCountTemplate },
      { field: 'spotsAvailable', header: 'Remaining', type: 'template', template: this.remainingTemplate },
      { field: 'accepting', header: 'Accepting', type: 'template', template: this.acceptingTemplate },
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
