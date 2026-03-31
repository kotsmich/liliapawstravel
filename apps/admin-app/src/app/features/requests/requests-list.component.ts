import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { loadTrips, selectAllTrips } from '@admin/features/trips/store';
import { sanitizeHtml } from '@admin/shared/utils/sanitize';
import { loadRequests, approveRequest, updateRequestStatus, deleteRequest, selectAllRequests, selectRequestsIsLoading } from '@admin/features/requests/store';
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
  ],
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss'],
  providers: [DatePipe],
})
export class RequestsListComponent implements OnInit {
  constructor(
    private store: Store,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {
    // Must be in constructor — takeUntilDestroyed() requires the injection context
    this.store.select(selectAllTrips).pipe(
      takeUntilDestroyed(),
    ).subscribe((trips: Trip[]) => {
      this.trips = trips;
      this.buildTripOptions(trips);
    });
  }

  loading$ = this.store.select(selectRequestsIsLoading);

  selectedTripId$ = new BehaviorSubject<string | null>(null);
  activeTab$ = new BehaviorSubject<string>('all');

  selectedRequest: TripRequest | null = null;
  dialogVisible = false;
  trips: Trip[] = [];
  tripOptions: Array<{ label: string; value: string | null }> = [{ label: 'All Trips', value: null }];

  // Filter requests by selected trip only (no tab filter) — used for badge counts
  private filteredByTrip$ = combineLatest([
    this.store.select(selectAllRequests),
    this.selectedTripId$,
  ]).pipe(
    map(([requests, tripId]: [TripRequest[], string | null]) =>
      tripId ? requests.filter((r) => r.tripId === tripId) : requests
    )
  );

  // Badge counts reflect the current trip selection so they always match the table
  pendingCount$ = this.filteredByTrip$.pipe(map((r) => r.filter((x) => x.status === 'pending').length));
  approvedCount$ = this.filteredByTrip$.pipe(map((r) => r.filter((x) => x.status === 'approved').length));
  rejectedCount$ = this.filteredByTrip$.pipe(map((r) => r.filter((x) => x.status === 'rejected').length));

  finalRequests$ = combineLatest([this.filteredByTrip$, this.activeTab$]).pipe(
    map(([requests, tab]) => {
      const filtered = tab !== 'all' ? requests.filter((r) => r.status === tab) : requests;
      return filtered.map((r) => ({ ...r, dogsCount: r.dogs.length }));
    })
  );

  ngOnInit(): void {
    this.store.dispatch(loadRequests());
    this.store.dispatch(loadTrips());

    // Pre-select nearest upcoming trip once trips load
    this.store.select(selectAllTrips).pipe(
      filter((trips: Trip[]) => trips.length > 0),
      take(1),
    ).subscribe((trips: Trip[]) => {
      const nearest = [...trips]
        .filter((t) => t.status === 'upcoming')
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      if (nearest) this.selectedTripId$.next(nearest.id);
    });
  }

  private buildTripOptions(trips: Trip[]): void {
    const upcoming = [...trips]
      .filter((t) => t.status === 'upcoming')
      .sort((a, b) => a.date.localeCompare(b.date));
    this.tripOptions = [
      { label: 'All Trips', value: null },
      ...upcoming.map((t) => ({
        label: `${this.fmtDate(t.date)} - ${t.departureCity} → ${t.arrivalCity}`,
        value: t.id,
      })),
    ];
  }

  fmtDate(date: string): string {
    if (!date) return '—';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }

  tripDate(tripId: string | undefined): string {
    if (!tripId) return '—';
    const trip = this.trips.find((t) => t.id === tripId);
    return trip ? this.fmtDate(trip.date) : tripId;
  }

  openDetail(request: TripRequest): void {
    this.selectedRequest = request;
    this.dialogVisible = true;
  }

  approve(): void {
    if (!this.selectedRequest?.tripId) return;
    const req = this.selectedRequest;
    this.confirmationService.confirm({
      header: 'Confirm Approval',
      message: `Approve the request for trip <strong>${sanitizeHtml(this.tripDate(req.tripId))}</strong> by <strong>${sanitizeHtml(req.requesterName)}</strong>?`,
      acceptLabel: 'Approve',
      rejectLabel: 'Back',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.store.dispatch(approveRequest({ requestId: req.id, tripId: req.tripId! }));
        this.messageService.add({ severity: 'success', summary: 'Approved', detail: 'Request confirmed. Trip dogs updated.' });
        this.dialogVisible = false;
      },
    });
  }

  reject(): void {
    if (!this.selectedRequest) return;
    const req = this.selectedRequest;
    this.confirmationService.confirm({
      header: 'Confirm Rejection',
      message: `Reject the request for trip <strong>${sanitizeHtml(this.tripDate(req.tripId))}</strong> by <strong>${sanitizeHtml(req.requesterName)}</strong>? This cannot be undone.`,
      acceptLabel: 'Reject',
      rejectLabel: 'Back',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(updateRequestStatus({ id: req.id, status: 'rejected' }));
        this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Request has been rejected.' });
        this.dialogVisible = false;
      },
    });
  }

  deleteRequest(req: TripRequest): void {
    this.confirmationService.confirm({
      header: 'Delete Request',
      message: `Delete the request from <strong>${sanitizeHtml(req.requesterName)}</strong>?${req.status === 'approved' ? ' The dogs added to the trip will remain.' : ''}`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(deleteRequest({ requestId: req.id }));
        this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Request deleted.' });
        this.dialogVisible = false;
      },
    });
  }

  cancel(): void {
    this.dialogVisible = false;
  }

  onApproveFromTable(req: TripRequest): void {
    this.selectedRequest = req;
    this.approve();
  }

  onRejectFromTable(req: TripRequest): void {
    this.selectedRequest = req;
    this.reject();
  }
}
