import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Store } from '@ngrx/store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BehaviorSubject, filter, of, switchMap, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { loadTrips, loadTripById, deleteTrip, updateDog, selectAllTrips, selectTripsIsLoading, selectTripsAsCalendarEvents, selectTripsForSelectedDate, selectTripById } from '@admin/features/trips/store';
import { selectDate, selectCalendarSelectedDate } from '@admin/core/store/calendar';
import { loadRequests, approveRequest, updateRequestStatus, deleteRequest, selectRequestsByTripId } from '@admin/features/requests/store';
import { LoadingSpinnerComponent } from '@ui/lib/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@ui/lib/components/page-header/page-header.component';
import { Trip } from '@models/lib/trip.model';
import { Dog } from '@models/lib/dog.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { CalendarEvent } from '@models/lib/calendar-event.model';
import { sanitizeHtml } from '@admin/shared/utils/sanitize';
import { TripCalendarViewComponent } from '../components/trip-calendar-view/trip-calendar-view.component';
import { AllTripsTabComponent } from '../components/all-trips-tab/all-trips-tab.component';
import { TripDetailDialogComponent } from '../components/trip-detail-dialog/trip-detail-dialog.component';
import { DogFormDialogComponent } from '../components/dog-form-dialog/dog-form-dialog.component';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-trip-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CardModule, ButtonModule, ConfirmDialogModule, ToastModule,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    TripCalendarViewComponent,
    AllTripsTabComponent,
    TripDetailDialogComponent,
    DogFormDialogComponent,
  ],
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.scss'],
})
export class TripsListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly exportService = inject(ExportService);
  private readonly destroyRef = inject(DestroyRef);

  trips$ = this.store.select(selectAllTrips);
  loading$ = this.store.select(selectTripsIsLoading);
  selectedDate$ = this.store.select(selectCalendarSelectedDate);
  calendarEvents$ = this.store.select(selectTripsAsCalendarEvents);

  tripsForDate$ = this.store.select(selectTripsForSelectedDate);

  // Sync properties for strict-template bindings to typed dumb components
  trips: Trip[] = [];
  calendarEvents: CalendarEvent[] = [];
  tripsForDate: Trip[] = [];
  detailTrip: Trip | null = null;
  detailRequests: TripRequest[] = [];

  selectedDate: string | null = null;
  activeTab: 'calendar' | 'all' = 'calendar';

  // Trip detail dialog
  detailDialogVisible = false;
  detailHeader = 'Trip Details';
  detailActiveTab = 'dogs';
  detailTripId$ = new BehaviorSubject<string | null>(null);

  detailTrip$ = this.detailTripId$.pipe(
    switchMap((id) => id ? this.store.select(selectTripById(id)) : of(null))
  );

  detailRequests$ = this.detailTripId$.pipe(
    switchMap((id) => id ? this.store.select(selectRequestsByTripId(id)) : of([]))
  );

  // Dog edit dialog (within trip detail)
  dogEditVisible = false;
  dogEditValues: Dog | null = null;
  dogEditTripId: string | null = null;

  constructor() {
    this.selectedDate$.pipe(takeUntilDestroyed()).subscribe((d) => { this.selectedDate = d; });
  }

  ngOnInit(): void {
    this.store.dispatch(loadTrips());

    // Auto-select the closest upcoming trip date once trips are loaded
    this.trips$.pipe(
      filter(trips => trips.length > 0),
      take(1),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((trips: Trip[]) => {
      const today = new Date().toISOString().slice(0, 10);
      const sorted = trips.map((t: Trip) => t.date).filter((d: string) => d >= today).sort();
      const date = sorted[0] ?? [...trips.map((t: Trip) => t.date)].sort().reverse()[0];
      if (date) this.store.dispatch(selectDate({ date }));
    });
  }

  onDateSelected(date: string): void {
    this.store.dispatch(selectDate({ date }));
  }

  addTripForDate(): void {
    const queryParams = this.selectedDate ? { date: this.selectedDate } : {};
    this.router.navigate(['/admin/trips/new'], { queryParams });
  }

  navigateNewTrip(): void {
    this.router.navigate(['/admin/trips/new']);
  }

  onEditTrip(trip: Trip): void {
    this.router.navigate(['/admin/trips', trip.id, 'edit']);
  }

  deleteTrip(trip: Trip): void {
    this.confirmationService.confirm({
      header: 'Delete Trip',
      message: `Delete the trip ${trip.departureCity} → ${trip.arrivalCity} on ${trip.date}?`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(deleteTrip({ id: trip.id }));
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Trip deleted.' });
      },
    });
  }

  openDetail(trip: Trip): void {
    const fmtDate = (d: string) => {
      if (!d) return '—';
      const [y, m, day] = d.split('-');
      return `${day}/${m}/${y}`;
    };
    this.detailHeader = `${trip.departureCity} → ${trip.arrivalCity}  ·  ${fmtDate(trip.date)}`;
    this.detailActiveTab = 'dogs';
    this.detailTripId$.next(trip.id);
    this.store.dispatch(loadTripById({ id: trip.id }));
    this.store.dispatch(loadRequests());
    this.detailDialogVisible = true;
  }

  onExportPdfFromCard(trip: Trip): void {
    this.exportService.exportTripById(trip.id);
  }

  closeDetail(): void {
    this.detailTripId$.next(null);
    this.dogEditVisible = false;
  }

  onEditDog(event: { dog: Dog; tripId: string }): void {
    this.dogEditValues = { ...event.dog };
    this.dogEditTripId = event.tripId;
    this.dogEditVisible = true;
  }

  onSaveDog(dog: Dog): void {
    if (!this.dogEditTripId) return;
    this.store.dispatch(updateDog({ tripId: this.dogEditTripId, dog }));
    this.messageService.add({ severity: 'success', summary: 'Dog Updated', detail: `${dog.name} saved.` });
    this.dogEditVisible = false;
  }

  onCancelDog(): void {
    this.dogEditVisible = false;
    this.dogEditValues = null;
  }

  approveRequestInDetail(req: TripRequest): void {
    this.confirmationService.confirm({
      header: 'Confirm Approval',
      message: `Approve request by <strong>${sanitizeHtml(req.requesterName)}</strong> (${req.dogs.length} dog${req.dogs.length !== 1 ? 's' : ''})?`,
      acceptLabel: 'Approve',
      rejectLabel: 'Back',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.store.dispatch(approveRequest({ requestId: req.id, tripId: req.tripId! }));
        this.messageService.add({ severity: 'success', summary: 'Approved', detail: 'Request approved. Dogs added to trip.' });
      },
    });
  }

  rejectRequestInDetail(req: TripRequest): void {
    this.confirmationService.confirm({
      header: 'Confirm Rejection',
      message: `Reject request by <strong>${sanitizeHtml(req.requesterName)}</strong>? This cannot be undone.`,
      acceptLabel: 'Reject',
      rejectLabel: 'Back',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(updateRequestStatus({ id: req.id, status: 'rejected' }));
        this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Request rejected.' });
      },
    });
  }

  deleteRequestInDetail(req: TripRequest): void {
    this.confirmationService.confirm({
      header: 'Delete Request',
      message: `Delete the request from <strong>${sanitizeHtml(req.requesterName)}</strong>?${req.status === 'approved' ? ' The dogs added to the trip will remain.' : ''}`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(deleteRequest({ requestId: req.id }));
        this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Request deleted.' });
      },
    });
  }
}
