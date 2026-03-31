import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';
import { Trip } from '@models/lib/trip.model';
import { Dog } from '@models/lib/dog.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';
import { EmptyStateComponent } from '@ui/lib/components/empty-state/empty-state.component';

type RequestDog = TripRequest['dogs'][number];

@Component({
  selector: 'app-trip-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DialogModule, ButtonModule, TagModule, TabsModule, AccordionModule, GenericTableComponent, EmptyStateComponent],
  templateUrl: './trip-detail-dialog.component.html',
  styleUrls: ['./trip-detail-dialog.component.scss'],
})
export class TripDetailDialogComponent implements OnInit {
  @Input() visible = false;
  @Input() header = 'Trip Details';
  @Input() trip: Trip | null = null;
  @Input() requests: TripRequest[] = [];
  @Input() activeTab = 'dogs';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() tabChanged = new EventEmitter<string>();
  @Output() editDog = new EventEmitter<{ dog: Dog; tripId: string }>();
  @Output() approveRequest = new EventEmitter<TripRequest>();
  @Output() rejectRequest = new EventEmitter<TripRequest>();
  @Output() deleteRequest = new EventEmitter<TripRequest>();
  @Output() closed = new EventEmitter<void>();

  dogColumns: TableColumn<Dog>[] = [
    { field: 'name', header: 'Name' },
    { field: 'size', header: 'Size' },
    { field: 'age', header: 'Age', formatter: (val) => `${val} yr` },
    { field: 'chipId', header: 'Chip ID' },
    { field: 'pickupLocation', header: 'Pickup' },
    { field: 'dropLocation', header: 'Drop' },
    { field: 'notes', header: 'Notes' },
  ];

  dogActions: TableAction<Dog>[] = [];

  requestDogColumns: TableColumn<RequestDog>[] = [
    { field: 'name', header: 'Name' },
    { field: 'size', header: 'Size' },
    { field: 'age', header: 'Age', formatter: (val) => `${val} yr` },
    { field: 'chipId', header: 'Chip ID' },
    { field: 'pickupLocation', header: 'Pickup' },
    { field: 'dropLocation', header: 'Drop' },
  ];

  tableConfig: TableConfig = { paginator: false, emptyMessage: 'No dogs on this trip yet.', trackByField: 'id' };
  requestDogConfig: TableConfig = { paginator: false, striped: true, trackByField: 'id' };

  ngOnInit(): void {
    this.dogActions = [
      {
        icon: 'pi pi-pencil', tooltip: 'Edit dog',
        action: (dog) => this.editDog.emit({ dog, tripId: this.trip!.id }),
      },
    ];
  }

  onHide(): void {
    this.visibleChange.emit(false);
    this.closed.emit();
  }

  requestStatusSeverity(status: TripRequest['status']): 'warn' | 'success' | 'danger' | 'secondary' {
    if (status === 'pending') return 'warn';
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'secondary';
  }
}
