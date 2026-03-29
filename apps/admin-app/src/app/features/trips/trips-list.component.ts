import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { BadgeModule } from 'primeng/badge';
import { Store } from '@ngrx/store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  TripActions, TripRequestActions, CalendarActions,
  selectAllTrips, selectTripsIsLoading, selectCalendarSelectedDate,
  selectTripsAsCalendarEvents, selectAllRequests,
} from '@myorg/store';
import { LoadingSpinnerComponent, TripCalendarComponent } from '@myorg/ui';
import { Trip, Dog, TripRequest } from '@myorg/models';

@Component({
  selector: 'app-trips-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    CardModule, ButtonModule, TagModule, ConfirmDialogModule, ToastModule, TableModule,
    DialogModule, TabsModule, AccordionModule, SelectModule, InputTextModule, InputNumberModule, BadgeModule,
    LoadingSpinnerComponent, TripCalendarComponent,
  ],
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.scss'],
})
export class TripsListComponent implements OnInit {
  trips$ = this.store.select(selectAllTrips);
  loading$ = this.store.select(selectTripsIsLoading);
  selectedDate$ = this.store.select(selectCalendarSelectedDate);
  calendarEvents$ = this.store.select(selectTripsAsCalendarEvents);

  tripsForDate$ = combineLatest([
    this.store.select(selectAllTrips),
    this.store.select(selectCalendarSelectedDate),
  ]).pipe(map(([trips, date]) => (date ? trips.filter((t: Trip) => t.date === date) : [])));

  selectedDate: string | null = null;
  activeTab: 'calendar' | 'all' = 'calendar';

  // Trip detail dialog
  detailDialogVisible = false;
  detailHeader = 'Trip Details';
  detailActiveTab = 'dogs';
  detailTripId$ = new BehaviorSubject<string | null>(null);

  detailTrip$ = combineLatest([
    this.store.select(selectAllTrips),
    this.detailTripId$,
  ]).pipe(
    map(([trips, id]) => id ? trips.find((t) => t.id === id) ?? null : null)
  );

  detailRequests$ = combineLatest([
    this.store.select(selectAllRequests),
    this.detailTripId$,
  ]).pipe(
    map(([requests, id]) =>
      id
        ? [...requests]
            .filter((r) => r.tripId === id)
            .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
        : []
    )
  );

  // Dog edit dialog (within trip detail)
  dogEditVisible = false;
  dogEditValues: Dog | null = null;
  dogEditTripId: string | null = null;

  dogSizes = [
    { label: 'Small (< 10 kg)', value: 'small' },
    { label: 'Medium (10–25 kg)', value: 'medium' },
    { label: 'Large (> 25 kg)', value: 'large' },
  ];

  constructor(
    private store: Store,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.selectedDate$.pipe(takeUntilDestroyed()).subscribe((d) => { this.selectedDate = d; });
  }

  ngOnInit(): void {
    this.store.dispatch(TripActions.loadTrips());
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.store.dispatch(CalendarActions.selectDate({ date: todayStr }));
  }

  onDateSelected(date: string): void {
    this.store.dispatch(CalendarActions.selectDate({ date }));
  }

  addTripForDate(): void {
    const queryParams = this.selectedDate ? { date: this.selectedDate } : {};
    this.router.navigate(['/admin/trips/new'], { queryParams });
  }

  deleteTrip(trip: Trip): void {
    this.confirmationService.confirm({
      header: 'Delete Trip',
      message: `Delete the trip ${trip.departureCity} → ${trip.arrivalCity} on ${trip.date}?`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(TripActions.deleteTrip({ id: trip.id }));
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Trip deleted.' });
      },
    });
  }

  openDetail(trip: Trip): void {
    this.detailHeader = `${trip.departureCity} → ${trip.arrivalCity}  ·  ${this.fmtDate(trip.date)}`;
    this.detailActiveTab = 'dogs';
    this.detailTripId$.next(trip.id);
    this.store.dispatch(TripActions.loadTripById({ id: trip.id }));
    this.store.dispatch(TripRequestActions.loadRequests());
    this.detailDialogVisible = true;
  }

  closeDetail(): void {
    this.detailTripId$.next(null);
    this.dogEditVisible = false;
  }

  openEditDog(dog: Dog, tripId: string): void {
    this.dogEditValues = { ...dog };
    this.dogEditTripId = tripId;
    this.dogEditVisible = true;
  }

  saveEditDog(): void {
    if (!this.dogEditTripId || !this.dogEditValues) return;
    this.store.dispatch(TripActions.updateDog({ tripId: this.dogEditTripId, dog: this.dogEditValues }));
    this.messageService.add({ severity: 'success', summary: 'Dog Updated', detail: `${this.dogEditValues.name} saved.` });
    this.dogEditVisible = false;
  }

  cancelEditDog(): void {
    this.dogEditVisible = false;
    this.dogEditValues = null;
  }

  approveRequestInDetail(req: TripRequest): void {
    this.confirmationService.confirm({
      header: 'Confirm Approval',
      message: `Approve request by <strong>${req.requesterName}</strong> (${req.dogs.length} dog${req.dogs.length !== 1 ? 's' : ''})?`,
      acceptLabel: 'Approve',
      rejectLabel: 'Back',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.store.dispatch(TripRequestActions.approveRequest({ requestId: req.id, tripId: req.tripId! }));
        this.messageService.add({ severity: 'success', summary: 'Approved', detail: 'Request approved. Dogs added to trip.' });
      },
    });
  }

  rejectRequestInDetail(req: TripRequest): void {
    this.confirmationService.confirm({
      header: 'Confirm Rejection',
      message: `Reject request by <strong>${req.requesterName}</strong>? This cannot be undone.`,
      acceptLabel: 'Reject',
      rejectLabel: 'Back',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(TripRequestActions.updateRequestStatus({ id: req.id, status: 'rejected' }));
        this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Request rejected.' });
      },
    });
  }

  deleteRequestInDetail(req: TripRequest): void {
    this.confirmationService.confirm({
      header: 'Delete Request',
      message: `Delete the request from <strong>${req.requesterName}</strong>?${req.status === 'approved' ? ' The dogs added to the trip will remain.' : ''}`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(TripRequestActions.deleteRequest({ requestId: req.id }));
        this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Request deleted.' });
      },
    });
  }

  fmtDate(date: string): string {
    if (!date) return '—';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }

  statusSeverity(status: Trip['status']): 'info' | 'success' | 'secondary' {
    return status === 'upcoming' ? 'info' : status === 'completed' ? 'success' : 'secondary';
  }

  requestStatusSeverity(status: TripRequest['status']): 'warn' | 'success' | 'danger' | 'secondary' {
    if (status === 'pending') return 'warn';
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'secondary';
  }
}
