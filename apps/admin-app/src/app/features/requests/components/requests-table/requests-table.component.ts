import { Component, ChangeDetectionStrategy, inject, computed, input, output, effect } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { TripRequest } from '@models/lib/trip-request.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { requestStatusSeverity, requestStatusLabel, RequestStatus } from '@admin/shared/utils/status';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

type RequestRow = TripRequest & { dogsCount: number };

@Component({
  selector: 'app-requests-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, GenericTableComponent, TranslocoModule],
  templateUrl: './requests-table.component.html',
  styleUrl: './requests-table.component.scss',
})
export class RequestsTableComponent {
  readonly requests = input<RequestRow[]>([]);
  readonly loading = input(false);
  readonly selection = input<TripRequest[]>([]);

  readonly rowClicked = output<TripRequest>();
  readonly approve = output<TripRequest>();
  readonly reject = output<TripRequest>();
  readonly selectionChange = output<TripRequest[]>();
  readonly bulkApprove = output<TripRequest[]>();
  readonly bulkReject = output<TripRequest[]>();

  private readonly transloco = inject(TranslocoService);
  private readonly _t = toSignal(this.transloco.selectTranslation(), { initialValue: null });

  constructor() {
    // Emit empty selection when requests are cleared while items were selected
    effect(() => {
      if (this.selection().length > 0 && this.requests().length === 0) {
        this.selectionChange.emit([]);
      }
    });
  }

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
          severity: (_, row) => requestStatusSeverity((row as RequestRow).status as RequestStatus),
          label:    (_, row) => requestStatusLabel((row as RequestRow).status as RequestStatus, this.transloco),
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

  readonly pendingSelected = computed(() =>
    this.selection().filter((request) => request.status === 'pending').length
  );

  onBulkApprove(): void {
    this.bulkApprove.emit(this.selection().filter((request) => request.status === 'pending' && request.tripId));
  }

  onBulkReject(): void {
    this.bulkReject.emit(this.selection().filter((request) => request.status === 'pending'));
  }
}
