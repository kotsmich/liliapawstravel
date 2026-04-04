import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { TripRequest } from '@models/lib/trip-request.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

type RequestRow = TripRequest & { dogsCount: number };

@Component({
  selector: 'app-requests-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonModule, GenericTableComponent, TranslocoModule],
  templateUrl: './requests-table.component.html',
  styles: [`.table-scroll { overflow-x: auto; }`],
})
export class RequestsTableComponent implements OnChanges {
  @Input() requests: RequestRow[] = [];
  @Input() loading = false;
  @Input() selection: TripRequest[] = [];

  @Output() rowClicked = new EventEmitter<TripRequest>();
  @Output() approve = new EventEmitter<TripRequest>();
  @Output() reject = new EventEmitter<TripRequest>();
  @Output() selectionChange = new EventEmitter<TripRequest[]>();
  @Output() bulkApprove = new EventEmitter<TripRequest[]>();
  @Output() bulkReject = new EventEmitter<TripRequest[]>();

  private readonly transloco = inject(TranslocoService);
  private readonly _t = toSignal(this.transloco.selectTranslation(), { initialValue: null });

  readonly tableConfig = computed((): TableConfig => {
    this._t();
    return {
      sortField: 'submittedAt',
      sortOrder: -1,
      paginator: false,
      emptyMessage: this.transloco.translate('requests.table.empty'),
      trackByField: 'id',
      selectable: true,
    };
  });

  readonly columns = computed((): TableColumn<RequestRow>[] => {
    this._t();
    return [
      { field: 'requesterName', header: this.transloco.translate('requests.table.requester'), sortable: true },
      { field: 'dogsCount', header: this.transloco.translate('requests.table.dogs'), sortable: true },
      {
        field: 'status', header: this.transloco.translate('requests.table.status'), sortable: true, type: 'badge',
        badgeConfig: {
          severity: (_, row) => {
            const r = row as RequestRow;
            if (r.status === 'pending') return 'warn';
            if (r.status === 'approved') return 'success';
            return 'danger';
          },
          label: (_, row) => {
            const status = (row as RequestRow).status;
            if (status === 'pending') return this.transloco.translate('requests.pending');
            if (status === 'approved') return this.transloco.translate('requests.approved');
            return this.transloco.translate('requests.rejected');
          },
        },
      },
    ];
  });

  readonly actions = computed((): TableAction<RequestRow>[] => {
    this._t();
    return [
      {
        icon: 'pi pi-eye',
        label: this.transloco.translate('requests.view'),
        tooltip: this.transloco.translate('requests.table.viewTooltip'),
        action: (req) => this.rowClicked.emit(req),
      },
      {
        icon: 'pi pi-check',
        label: this.transloco.translate('requests.approve'),
        tooltip: this.transloco.translate('requests.table.approveTooltip'),
        severity: 'success',
        visible: (req) => req.status === 'pending',
        action: (req) => this.approve.emit(req),
      },
      {
        icon: 'pi pi-times',
        label: this.transloco.translate('requests.reject'),
        tooltip: this.transloco.translate('requests.table.rejectTooltip'),
        severity: 'danger',
        visible: (req) => req.status === 'pending',
        action: (req) => this.reject.emit(req),
      },
    ];
  });

  readonly rowSelectable = (req: RequestRow): boolean => req.status === 'pending';

  get pendingSelected(): number {
    return this.selection.filter((r) => r.status === 'pending').length;
  }

  ngOnChanges(): void {
    if (this.selection.length > 0 && this.requests.length === 0) {
      this.selectionChange.emit([]);
    }
  }

  onBulkApprove(): void {
    this.bulkApprove.emit(this.selection.filter((r) => r.status === 'pending' && r.tripId));
  }

  onBulkReject(): void {
    this.bulkReject.emit(this.selection.filter((r) => r.status === 'pending'));
  }
}
