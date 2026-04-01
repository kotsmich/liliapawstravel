import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TripRequest } from '@models/lib/trip-request.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

type RequestRow = TripRequest & { dogsCount: number };

@Component({
  selector: 'app-requests-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonModule, GenericTableComponent],
  templateUrl: './requests-table.component.html',
  styles: [`.table-scroll { overflow-x: auto; }`],
})
export class RequestsTableComponent implements OnInit, OnChanges {
  @Input() requests: RequestRow[] = [];
  @Input() loading = false;
  @Input() selection: TripRequest[] = [];

  @Output() rowClicked = new EventEmitter<TripRequest>();
  @Output() approve = new EventEmitter<TripRequest>();
  @Output() reject = new EventEmitter<TripRequest>();
  @Output() deleteRequest = new EventEmitter<TripRequest>();
  @Output() selectionChange = new EventEmitter<TripRequest[]>();
  @Output() bulkApprove = new EventEmitter<TripRequest[]>();
  @Output() bulkReject = new EventEmitter<TripRequest[]>();

  columns: TableColumn<RequestRow>[] = [
    { field: 'requesterName', header: 'Requester', sortable: true },
    { field: 'dogsCount', header: 'Dogs', sortable: true },
    {
      field: 'status', header: 'Status', sortable: true, type: 'badge',
      badgeConfig: {
        severity: (_, row) => {
          const r = row as RequestRow;
          if (r.status === 'pending') return 'warn';
          if (r.status === 'approved') return 'success';
          return 'danger';
        },
        label: (_, row) => (row as RequestRow).status,
      },
    },
    { field: 'submittedAt', header: 'Submitted', sortable: true, type: 'date', dateFormat: 'dd/MM/yyyy HH:mm' },
  ];

  actions: TableAction<RequestRow>[] = [];

  tableConfig: TableConfig = {
    sortField: 'submittedAt',
    sortOrder: -1,
    paginator: false,
    emptyMessage: 'No requests found.',
    trackByField: 'id',
    selectable: true,
  };

  get pendingSelected(): number {
    return this.selection.filter((r) => r.status === 'pending').length;
  }

  ngOnChanges(): void {
    // Clear selection when the request list reloads (e.g. after bulk action)
    if (this.selection.length > 0 && this.requests.length === 0) {
      this.selectionChange.emit([]);
    }
  }

  ngOnInit(): void {
    this.actions = [
      {
        icon: 'pi pi-eye', label: 'View', tooltip: 'View details',
        action: (req) => this.rowClicked.emit(req),
      },
      {
        icon: 'pi pi-check', label: 'Approve', tooltip: 'Approve', severity: 'success',
        visible: (req) => req.status === 'pending',
        action: (req) => this.approve.emit(req),
      },
      {
        icon: 'pi pi-times', label: 'Reject', tooltip: 'Reject', severity: 'danger',
        visible: (req) => req.status === 'pending',
        action: (req) => this.reject.emit(req),
      },
      {
        icon: 'pi pi-trash', label: 'Delete', tooltip: 'Delete', severity: 'danger',
        visible: (req) => req.status !== 'pending',
        action: (req) => this.deleteRequest.emit(req),
      },
    ];
  }

  onBulkApprove(): void {
    this.bulkApprove.emit(this.selection.filter((r) => r.status === 'pending' && r.tripId));
  }

  onBulkReject(): void {
    this.bulkReject.emit(this.selection.filter((r) => r.status === 'pending'));
  }
}
