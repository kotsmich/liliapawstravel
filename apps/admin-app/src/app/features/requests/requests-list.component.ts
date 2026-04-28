import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LocalDatePipe } from '@ui/lib/pipes/local-date.pipe';
import { TranslocoModule } from '@jsverse/transloco';
import { Action, Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { loadTrips, selectAllTrips } from '@admin/features/trips/store';
import {
  loadRequests,
  updateRequestNote, setSelectedRequests, setSelectedTripId,
  selectAllRequests,
  selectRequestsViewModel, initialRequestsViewModel,
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
    ButtonModule, ConfirmDialogModule,
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

  private readonly vm = toSignal(this.store.select(selectRequestsViewModel), { initialValue: initialRequestsViewModel });

  readonly loading          = computed(() => this.vm().loading);
  readonly selectedTripId   = computed(() => this.vm().selectedTripId);
  readonly selectedRequests = computed(() => this.vm().selectedRequests);
  readonly trips            = computed(() => this.vm().trips);
  readonly pendingCount     = computed(() => this.vm().pendingCount);
  readonly approvedCount    = computed(() => this.vm().approvedCount);
  readonly rejectedCount    = computed(() => this.vm().rejectedCount);
  readonly cancelledCount   = computed(() => this.vm().cancelledCount);
  private readonly allRequests      = computed(() => this.vm().allRequests);
  private readonly filteredRequests = computed(() => this.vm().filteredRequests);

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
    this.dispatchIfMissing(this.store.select(selectAllRequests), () => loadRequests());
    this.dispatchIfMissing(this.store.select(selectAllTrips),    () => loadTrips());
  }

  onSelectionChange(requests: TripRequest[]): void { this.store.dispatch(setSelectedRequests({ ids: requests.map((r) => r.id) })); }
  onTripSelected(tripId: string | null): void      { this.store.dispatch(setSelectedTripId({ tripId })); }
  openDetail(request: TripRequest): void {
    this.selectedRequestId.set(request.id);
    this.dialogVisible.set(true);
  }
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

  onApproveFromTable(req: TripRequest): void {
    this.selectedRequestId.set(req.id);
    this.approvalService.approve(req, this.tripDate(req.tripId));
  }
  onRejectFromTable(req: TripRequest): void {
    this.selectedRequestId.set(req.id);
    this.approvalService.reject(req, this.tripDate(req.tripId));
  }
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

  private dispatchIfMissing<T>(source: Observable<T[]>, actionFactory: () => Action): void {
    source.pipe(take(1)).subscribe((value) => {
      if (!value || value.length === 0) this.store.dispatch(actionFactory());
    });
  }
}
