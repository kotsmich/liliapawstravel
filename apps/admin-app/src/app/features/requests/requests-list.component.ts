import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { loadTrips, selectAllTrips } from '@admin/features/trips/store';
import { sanitizeHtml } from '@admin/shared/utils/sanitize';
import {
  loadRequests, approveRequest, rejectRequest,
  selectAllRequests, selectRequestsIsLoading,
  bulkApproveRequests, bulkRejectRequests,
  updateRequestNote,
  setSelectedRequests, setSelectedTripId,
  selectSelectedRequests, selectSelectedTripId,
} from '@admin/features/requests/store';
import { resetRequests } from '@admin/core/store/notifications';
import { TripRequest } from '@models/lib/trip-request.model';
import { Trip } from '@models/lib/trip.model';
import { PageHeaderComponent } from '@ui/lib/components/page-header/page-header.component';
import { RequestsFilterComponent } from './components/requests-filter/requests-filter.component';
import { RequestsTableComponent } from './components/requests-table/requests-table.component';
import { RequestDetailDialogComponent } from './components/request-detail-dialog/request-detail-dialog.component';

@Component({
  selector: 'app-requests-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule, ConfirmDialogModule,
    PageHeaderComponent,
    RequestsFilterComponent, RequestsTableComponent, RequestDetailDialogComponent,
    TranslocoModule,
  ],
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss'],
  providers: [DatePipe],
})
export class RequestsListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  loading$ = this.store.select(selectRequestsIsLoading);

  readonly selectedTripId = toSignal(this.store.select(selectSelectedTripId), { initialValue: null as string | null });
  activeTab = signal('all');
  selectedRequestId = signal<string | null>(null);
  readonly selectedRequests = toSignal(this.store.select(selectSelectedRequests), { initialValue: [] as TripRequest[] });
  dialogVisible = signal(false);

  readonly trips = toSignal(this.store.select(selectAllTrips), { initialValue: [] as Trip[] });
  private readonly allRequests = toSignal(this.store.select(selectAllRequests), { initialValue: [] as TripRequest[] });
  readonly tripOptions = computed(() => this.buildTripOptionsFrom(this.trips(), this.allRequests()));
  readonly selectedRequest = computed(() => {
    const id = this.selectedRequestId();
    return this.allRequests().find((r) => r.id === id) ?? null;
  });

  // Filter requests by selected trip only (no tab filter) — used for badge counts
  private readonly filteredByTrip = computed(() => {
    const requests = this.allRequests();
    const tripId = this.selectedTripId();
    return tripId ? requests.filter((r) => r.tripId === tripId) : requests;
  });

  readonly pendingCount  = computed(() => this.filteredByTrip().filter((x) => x.status === 'pending').length);
  readonly approvedCount = computed(() => this.filteredByTrip().filter((x) => x.status === 'approved').length);
  readonly rejectedCount = computed(() => this.filteredByTrip().filter((x) => x.status === 'rejected').length);

  readonly finalRequests = computed(() => {
    const requests = this.filteredByTrip();
    const tab = this.activeTab();
    const filtered = tab !== 'all' ? requests.filter((r) => r.status === tab) : requests;
    return filtered.map((r) => ({ ...r, dogsCount: r.dogs.length }));
  });

  ngOnInit(): void {
    this.store.dispatch(resetRequests());
    this.store.dispatch(loadRequests());
    this.store.dispatch(loadTrips());
  }

  onSelectionChange(requests: TripRequest[]): void {
    this.store.dispatch(setSelectedRequests({ requests }));
  }

  onTripSelected(tripId: string | null): void {
    this.store.dispatch(setSelectedTripId({ tripId }));
  }

  private buildTripOptionsFrom(trips: Trip[], requests: TripRequest[] = []): Array<{ label: string; value: string; pending: number }> {
    return [...trips]
      .filter((t) => t.status === 'upcoming')
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((t) => ({
        label: this.fmtDate(t.date),
        value: t.id,
        pending: requests.filter((r) => r.tripId === t.id && r.status === 'pending').length,
      }));
  }

  fmtDate(date: string): string {
    if (!date) return '—';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }

  tripDate(tripId: string | undefined): string {
    if (!tripId) return '—';
    const trip = this.trips().find((t) => t.id === tripId);
    return trip ? this.fmtDate(trip.date) : tripId;
  }

  openDetail(request: TripRequest): void {
    this.selectedRequestId.set(request.id);
    this.dialogVisible.set(true);
  }

  approve(): void {
    if (!this.selectedRequest()?.tripId) return;
    const req = this.selectedRequest()!;
    this.confirmationService.confirm({
      header: 'Confirm Approval',
      message: `Approve the request for trip <strong>${sanitizeHtml(this.tripDate(req.tripId))}</strong> by <strong>${sanitizeHtml(req.requesterName)}</strong>?`,
      acceptLabel: 'Approve',
      rejectLabel: 'Back',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.store.dispatch(approveRequest({ requestId: req.id, tripId: req.tripId! }));
        this.dialogVisible.set(false);
      },
    });
  }

  reject(): void {
    if (!this.selectedRequest()) return;
    const req = this.selectedRequest()!;
    this.confirmationService.confirm({
      header: 'Confirm Rejection',
      message: `Reject the request for trip <strong>${sanitizeHtml(this.tripDate(req.tripId))}</strong> by <strong>${sanitizeHtml(req.requesterName)}</strong>? This cannot be undone.`,
      acceptLabel: 'Reject',
      rejectLabel: 'Back',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(rejectRequest({ id: req.id }));
        this.dialogVisible.set(false);
      },
    });
  }

  cancel(): void {
    this.dialogVisible.set(false);
  }

  onApproveFromTable(req: TripRequest): void {
    this.selectedRequestId.set(req.id);
    this.approve();
  }

  onRejectFromTable(req: TripRequest): void {
    this.selectedRequestId.set(req.id);
    this.reject();
  }

  onBulkApprove(requests: TripRequest[]): void {
    if (!requests.length) {
      this.messageService.add({ severity: 'warn', summary: 'Nothing to approve', detail: 'Select pending requests assigned to a trip.' });
      return;
    }
    this.confirmationService.confirm({
      header: 'Bulk Approve',
      message: `Approve <strong>${sanitizeHtml(String(requests.length))}</strong> pending request(s)?`,
      acceptLabel: 'Approve All',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => this.store.dispatch(bulkApproveRequests({ ids: requests.map((r) => r.id) })),
    });
  }

  onBulkReject(requests: TripRequest[]): void {
    if (!requests.length) {
      this.messageService.add({ severity: 'warn', summary: 'Nothing to reject', detail: 'Select pending requests to reject.' });
      return;
    }
    this.confirmationService.confirm({
      header: 'Bulk Reject',
      message: `Reject <strong>${sanitizeHtml(String(requests.length))}</strong> pending request(s)? This cannot be undone.`,
      acceptLabel: 'Reject All',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.store.dispatch(bulkRejectRequests({ ids: requests.map((r) => r.id) })),
    });
  }

  onSaveNote(note: string): void {
    const id = this.selectedRequestId();
    if (!id) return;
    this.store.dispatch(updateRequestNote({ id, note }));
  }
}
