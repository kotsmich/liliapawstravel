import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { MessageService, ConfirmationService } from 'primeng/api';
import {
  TripRequestActions, TripActions,
  selectAllRequests, selectRequestsIsLoading, selectAllTrips,
  selectPendingRequestsCount, selectApprovedRequestsCount, selectRejectedRequestsCount,
} from '@myorg/store';
import { TripRequest, Trip } from '@myorg/models';

@Component({
  selector: 'app-requests-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, TagModule, DialogModule, ButtonModule,
    ToastModule, ConfirmDialogModule,
    SelectModule, TabsModule, BadgeModule,
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
  ) {}

  loading$ = this.store.select(selectRequestsIsLoading);
  pendingCount$ = this.store.select(selectPendingRequestsCount);
  approvedCount$ = this.store.select(selectApprovedRequestsCount);
  rejectedCount$ = this.store.select(selectRejectedRequestsCount);

  selectedTripId$ = new BehaviorSubject<string | null>(null);
  activeTab$ = new BehaviorSubject<string>('all');

  selectedRequest: TripRequest | null = null;
  dialogVisible = false;
  trips: Trip[] = [];
  tripOptions: Array<{ label: string; value: string | null }> = [{ label: 'All Trips', value: null }];

  finalRequests$ = combineLatest([
    this.store.select(selectAllRequests),
    this.selectedTripId$,
    this.activeTab$,
  ]).pipe(
    map(([requests, tripId, tab]) => {
      let filtered = tripId ? requests.filter((r) => r.tripId === tripId) : requests;
      if (tab !== 'all') filtered = filtered.filter((r) => r.status === tab);
      return filtered.map((r) => ({ ...r, dogsCount: r.dogs.length }));
    })
  );

  ngOnInit(): void {
    this.store.dispatch(TripRequestActions.loadRequests());
    this.store.dispatch(TripActions.loadTrips());

    this.store.select(selectAllTrips).subscribe((trips) => {
      this.trips = trips;
      this.buildTripOptions(trips);
    });

    // Pre-select nearest upcoming trip once trips load
    this.store.select(selectAllTrips).pipe(
      filter((trips) => trips.length > 0),
      take(1),
    ).subscribe((trips) => {
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
      message: `Approve the request for trip <strong>${this.tripDate(req.tripId)}</strong> by <strong>${req.requesterName}</strong>?`,
      acceptLabel: 'Approve',
      rejectLabel: 'Back',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.store.dispatch(TripRequestActions.approveRequest({ requestId: req.id, tripId: req.tripId! }));
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
      message: `Reject the request for trip <strong>${this.tripDate(req.tripId)}</strong> by <strong>${req.requesterName}</strong>? This cannot be undone.`,
      acceptLabel: 'Reject',
      rejectLabel: 'Back',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(TripRequestActions.updateRequestStatus({ id: req.id, status: 'rejected' }));
        this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Request has been rejected.' });
        this.dialogVisible = false;
      },
    });
  }

  cancel(): void {
    this.dialogVisible = false;
  }

  statusSeverity(status: TripRequest['status']): 'warn' | 'success' | 'danger' | 'secondary' {
    if (status === 'pending') return 'warn';
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'secondary';
  }
}
