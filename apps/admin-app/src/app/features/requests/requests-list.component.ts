import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LocalDatePipe } from '@ui/lib/pipes/local-date.pipe';
import { TranslocoModule } from '@jsverse/transloco';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { loadTrips, selectAllTrips } from '@admin/features/trips/store';
import {
  loadRequests, selectRequestsIsLoading,
  updateRequestNote, setSelectedRequests, setSelectedTripId,
  selectSelectedRequests, selectSelectedTripId, selectAllRequests,
} from '@admin/features/requests/store';
import {
  selectFilteredBySelectedTrip,
  selectPendingCount, selectApprovedCount, selectRejectedCount, selectCancelledCount,
} from '@admin/features/requests/store';
import { resetRequests } from '@admin/core/store/notifications';
import { TripRequest } from '@models/lib/trip-request.model';
import { Trip } from '@models/lib/trip.model';
import { PageHeaderComponent } from '@ui/lib/components/page-header/page-header.component';
import { RequestsFilterComponent } from './components/requests-filter/requests-filter.component';
import { RequestsTableComponent } from './components/requests-table/requests-table.component';
import { RequestDetailDialogComponent } from './components/request-detail-dialog/request-detail-dialog.component';
import { RequestsApprovalService } from './requests-approval.service';

@Component({
  selector: 'app-requests-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule, ToastModule, ConfirmDialogModule,
    PageHeaderComponent,
    RequestsFilterComponent, RequestsTableComponent, RequestDetailDialogComponent,
    TranslocoModule,
  ],
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss'],
  providers: [DatePipe, LocalDatePipe],
})
export class RequestsListComponent implements OnInit {
  private readonly store    = inject(Store);
  private readonly localDate = inject(LocalDatePipe);
  private readonly approvalService = inject(RequestsApprovalService);

  readonly loading          = toSignal(this.store.select(selectRequestsIsLoading),       { initialValue: false });
  readonly selectedTripId   = toSignal(this.store.select(selectSelectedTripId),          { initialValue: null as string | null });
  readonly selectedRequests = toSignal(this.store.select(selectSelectedRequests),        { initialValue: [] as TripRequest[] });
  readonly trips            = toSignal(this.store.select(selectAllTrips),                { initialValue: [] as Trip[] });
  readonly pendingCount     = toSignal(this.store.select(selectPendingCount),            { initialValue: 0 });
  readonly approvedCount    = toSignal(this.store.select(selectApprovedCount),           { initialValue: 0 });
  readonly rejectedCount    = toSignal(this.store.select(selectRejectedCount),           { initialValue: 0 });
  readonly cancelledCount   = toSignal(this.store.select(selectCancelledCount),          { initialValue: 0 });
  private readonly allRequests      = toSignal(this.store.select(selectAllRequests),             { initialValue: [] as TripRequest[] });
  private readonly filteredRequests = toSignal(this.store.select(selectFilteredBySelectedTrip), { initialValue: [] as TripRequest[] });

  activeTab         = signal('all');
  selectedRequestId = signal<string | null>(null);
  dialogVisible     = signal(false);

  readonly tripOptions     = computed(() => this.buildTripOptionsFrom(this.trips(), this.allRequests()));
  readonly selectedRequest = computed(() => this.allRequests().find((r) => r.id === this.selectedRequestId()) ?? null);
  readonly finalRequests   = computed(() => {
    const tab = this.activeTab();
    const requests = this.filteredRequests();
    return (tab !== 'all' ? requests.filter((r) => r.status === tab) : requests)
      .map((r) => ({ ...r, dogsCount: r.dogs?.length ?? 0 }));
  });

  ngOnInit(): void {
    this.store.dispatch(resetRequests());
    this.store.dispatch(loadRequests());
    this.store.dispatch(loadTrips());
  }

  onSelectionChange(requests: TripRequest[]): void { this.store.dispatch(setSelectedRequests({ ids: requests.map((r) => r.id) })); }
  onTripSelected(tripId: string | null): void      { this.store.dispatch(setSelectedTripId({ tripId })); }
  openDetail(request: TripRequest): void           { this.selectedRequestId.set(request.id); this.dialogVisible.set(true); }
  cancel(): void                                   { this.dialogVisible.set(false); }
  onSaveNote(note: string): void {
    const id = this.selectedRequestId();
    if (id) this.store.dispatch(updateRequestNote({ id, note }));
  }

  approve(): void {
    const req = this.selectedRequest();
    if (!req?.tripId) return;
    this.approvalService.approve(req, this.tripDate(req.tripId), () => this.dialogVisible.set(false));
  }

  reject(): void {
    const req = this.selectedRequest();
    if (!req) return;
    this.approvalService.reject(req, this.tripDate(req.tripId), () => this.dialogVisible.set(false));
  }

  onApproveFromTable(req: TripRequest): void { this.selectedRequestId.set(req.id); this.approvalService.approve(req, this.tripDate(req.tripId)); }
  onRejectFromTable(req: TripRequest): void  { this.selectedRequestId.set(req.id); this.approvalService.reject(req, this.tripDate(req.tripId)); }
  onBulkApprove(requests: TripRequest[]): void { this.approvalService.bulkApprove(requests); }
  onBulkReject(requests: TripRequest[]): void  { this.approvalService.bulkReject(requests); }

  tripDate(tripId: string | undefined): string {
    if (!tripId) return '—';
    const trip = this.trips().find((t) => t.id === tripId);
    return trip ? this.localDate.transform(trip.date) : tripId;
  }

  private buildTripOptionsFrom(trips: Trip[], requests: TripRequest[]): Array<{ label: string; value: string; pending: number }> {
    return [...trips]
      .filter((trip) => trip.status === 'upcoming')
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((trip) => ({
        label:   this.localDate.transform(trip.date),
        value:   trip.id,
        pending: requests.filter((r) => r.tripId === trip.id && r.status === 'pending').length,
      }));
  }
}
