import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, map, shareReplay, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { loadTrips, selectAllTrips } from '@admin/features/trips/store';
import { sanitizeHtml } from '@admin/shared/utils/sanitize';
import {
  loadRequests, approveRequest, updateRequestStatus, deleteRequest,
  selectAllRequests, selectRequestsIsLoading,
  bulkApproveRequests, bulkApproveRequestsSuccess, bulkApproveRequestsFailure,
  bulkRejectRequests, bulkRejectRequestsSuccess, bulkRejectRequestsFailure,
  updateRequestNote, updateRequestNoteSuccess, updateRequestNoteFailure,
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
  ],
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss'],
  providers: [DatePipe],
})
export class RequestsListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  loading$ = this.store.select(selectRequestsIsLoading);

  selectedTripId$ = new BehaviorSubject<string | null>(null);
  activeTab$ = new BehaviorSubject<string>('all');
  selectedRequestId$ = new BehaviorSubject<string | null>(null);

  selectedRequest = signal<TripRequest | null>(null);
  selectedRequests = signal<TripRequest[]>([]);
  dialogVisible = signal(false);
  trips: Trip[] = [];
  tripOptions: Array<{ label: string; value: string | null }> = [{ label: 'All Trips', value: null }];

  // Filter requests by selected trip only (no tab filter) — used for badge counts
  private filteredByTrip$ = combineLatest([
    this.store.select(selectAllRequests),
    this.selectedTripId$,
  ]).pipe(
    map(([requests, tripId]: [TripRequest[], string | null]) =>
      tripId ? requests.filter((r) => r.tripId === tripId) : requests
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
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

  constructor() {
    // Must be in constructor — takeUntilDestroyed() requires the injection context
    combineLatest([
      this.store.select(selectAllTrips),
      this.store.select(selectAllRequests),
    ]).pipe(
      takeUntilDestroyed(),
    ).subscribe(([trips, requests]: [Trip[], TripRequest[]]) => {
      this.trips = trips;
      this.buildTripOptions(trips, requests);
    });

    // Keep selectedRequest in sync with store so note saves reflect immediately
    combineLatest([
      this.store.select(selectAllRequests),
      this.selectedRequestId$,
    ]).pipe(
      takeUntilDestroyed(),
    ).subscribe(([requests, id]) => {
      if (id) {
        const updated = requests.find((r) => r.id === id);
        if (updated) this.selectedRequest.set(updated);
      }
    });

    // Toast + selection clear after bulk actions
    this.actions$.pipe(
      ofType(bulkApproveRequestsSuccess, bulkRejectRequestsSuccess),
      takeUntilDestroyed(),
    ).subscribe((action) => {
      this.selectedRequests.set([]);
      const { succeeded, failed } = action;
      const verb = action.type.includes('Approve') ? 'approved' : 'rejected';
      if (failed.length === 0) {
        this.messageService.add({ severity: 'success', summary: 'Done', detail: `${succeeded.length} request(s) ${verb}.` });
      } else {
        this.messageService.add({ severity: 'warn', summary: 'Partial success', detail: `${succeeded.length} ${verb}, ${failed.length} failed.` });
      }
    });

    this.actions$.pipe(
      ofType(bulkApproveRequestsFailure, bulkRejectRequestsFailure),
      takeUntilDestroyed(),
    ).subscribe(({ error }) => {
      this.messageService.add({ severity: 'error', summary: 'Bulk action failed', detail: error });
    });

    this.actions$.pipe(
      ofType(updateRequestNoteSuccess),
      takeUntilDestroyed(),
    ).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Note saved', detail: 'Admin note has been saved.' });
    });

    this.actions$.pipe(
      ofType(updateRequestNoteFailure),
      takeUntilDestroyed(),
    ).subscribe(({ error }) => {
      this.messageService.add({ severity: 'error', summary: 'Failed to save note', detail: error });
    });
  }

  ngOnInit(): void {
    this.store.dispatch(resetRequests());
    this.store.dispatch(loadRequests());
    this.store.dispatch(loadTrips());

    // Pre-select nearest upcoming trip once trips load
    this.store.select(selectAllTrips).pipe(
      filter((trips: Trip[]) => trips.length > 0),
      take(1),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((trips: Trip[]) => {
      const nearest = [...trips]
        .filter((t) => t.status === 'upcoming')
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      if (nearest) this.selectedTripId$.next(nearest.id);
    });
  }

  private buildTripOptions(trips: Trip[], requests: TripRequest[] = []): void {
    const upcoming = [...trips]
      .filter((t) => t.status === 'upcoming')
      .sort((a, b) => a.date.localeCompare(b.date));
    this.tripOptions = [
      { label: 'All Trips', value: null },
      ...upcoming.map((t) => {
        const pending = requests.filter((r) => r.tripId === t.id && r.status === 'pending').length;
        const pendingLabel = pending > 0 ? ` · ${pending} pending` : '';
        return {
          label: `${this.fmtDate(t.date)} - ${t.departureCity} → ${t.arrivalCity}${pendingLabel}`,
          value: t.id,
        };
      }),
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
    this.selectedRequestId$.next(request.id);
    this.selectedRequest.set(request);
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
        this.messageService.add({ severity: 'success', summary: 'Approved', detail: 'Request confirmed. Trip dogs updated.' });
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
        this.store.dispatch(updateRequestStatus({ id: req.id, status: 'rejected' }));
        this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Request has been rejected.' });
        this.dialogVisible.set(false);
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
        this.dialogVisible.set(false);
      },
    });
  }

  cancel(): void {
    this.dialogVisible.set(false);
  }

  onApproveFromTable(req: TripRequest): void {
    this.selectedRequest.set(req);
    this.approve();
  }

  onRejectFromTable(req: TripRequest): void {
    this.selectedRequest.set(req);
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
    const id = this.selectedRequestId$.value;
    if (!id) return;
    this.store.dispatch(updateRequestNote({ id, note }));
  }
}
