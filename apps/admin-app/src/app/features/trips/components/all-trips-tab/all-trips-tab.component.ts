import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { Trip } from '@models/lib/trip.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

@Component({
  selector: 'app-all-trips-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TagModule, GenericTableComponent],
  templateUrl: './all-trips-tab.component.html',
  styleUrls: ['./all-trips-tab.component.scss'],
})
export class AllTripsTabComponent implements OnInit {
  @Input() trips: Trip[] = [];
  @Output() editTrip = new EventEmitter<Trip>();
  @Output() deleteTrip = new EventEmitter<Trip>();
  @Output() viewDetails = new EventEmitter<Trip>();

  @ViewChild('routeTpl', { static: true }) routeTpl!: TemplateRef<unknown>;
  @ViewChild('filledTpl', { static: true }) filledTpl!: TemplateRef<unknown>;
  @ViewChild('remainingTpl', { static: true }) remainingTpl!: TemplateRef<unknown>;
  @ViewChild('acceptingTpl', { static: true }) acceptingTpl!: TemplateRef<unknown>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<unknown>;

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

  ngOnInit(): void {
    this.columns = [
      { field: 'date', header: 'Date', sortable: true },
      { field: 'route', header: 'Route', type: 'template', template: this.routeTpl },
      { field: 'totalCapacity', header: 'Capacity', sortable: true },
      { field: 'dogs', header: 'Filled', type: 'template', template: this.filledTpl },
      { field: 'spotsAvailable', header: 'Remaining', type: 'template', template: this.remainingTpl },
      { field: 'acceptingRequests', header: 'Accepting', type: 'template', template: this.acceptingTpl },
      { field: 'status', header: 'Status', type: 'template', template: this.statusTpl },
    ];
  }
}
