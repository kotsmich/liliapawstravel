import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LocalDatePipe } from '@ui/lib/pipes/local-date.pipe';
import { TranslocoModule } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Store } from '@ngrx/store';
import { ConfirmationService } from 'primeng/api';
import { of, switchMap } from 'rxjs';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { loadTrips, loadTripById, deleteTrip, updateDog, deleteDog, selectAllTrips, selectTripsIsLoading, selectTripsAsCalendarEvents, selectTripsForSelectedDate, selectTripById } from '@admin/features/trips/store';
import { selectDate, selectCalendarSelectedDate } from '@admin/core/store/calendar';
import { loadRequests, approveRequest, rejectRequest, deleteRequest, selectRequestsByTripId } from '@admin/features/requests/store';
import { LoadingSpinnerComponent } from '@ui/lib/loading-spinner/loading-spinner.component';
import { Trip } from '@models/lib/trip.model';
import { Dog } from '@models/lib/dog.model';
import { TripRequest } from '@models/lib/trip-request.model';
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
    AsyncPipe,
    CardModule, ButtonModule, ConfirmDialogModule, ToastModule,
    LoadingSpinnerComponent,
    TripCalendarViewComponent,
    AllTripsTabComponent,
    TripDetailDialogComponent,
    DogFormDialogComponent,
    TranslocoModule,
  ],
  providers: [LocalDatePipe],
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.scss'],
})
export class TripsListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly exportService = inject(ExportService);
  private readonly localDate = inject(LocalDatePipe);

  trips$ = this.store.select(selectAllTrips);
  loading$ = this.store.select(selectTripsIsLoading);
  calendarEvents$ = this.store.select(selectTripsAsCalendarEvents);

  tripsForDate$ = this.store.select(selectTripsForSelectedDate);

readonly selectedDate = toSignal(this.store.select(selectCalendarSelectedDate), { initialValue: null });
  activeTab: 'calendar' | 'all' = 'calendar';

  // Trip detail dialog
  detailDialogVisible = false;
  detailHeader = 'Trip Details';
  detailActiveTab = 'dogs';
  detailTripId = signal<string | null>(null);

  readonly detailTrip = toSignal(toObservable(this.detailTripId).pipe(
    switchMap((id) => id ? this.store.select(selectTripById(id)) : of(null))
  ), { initialValue: null as Trip | null });

  readonly detailRequests = toSignal(toObservable(this.detailTripId).pipe(
    switchMap((id) => id ? this.store.select(selectRequestsByTripId(id)) : of([]))
  ), { initialValue: [] as TripRequest[] });

  // Dog edit dialog (within trip detail)
  dogEditVisible = false;
  dogEditValues: Dog | null = null;
  dogEditTripId: string | null = null;

  ngOnInit(): void {
    this.store.dispatch(loadTrips());
  }

  onDateSelected(date: string): void {
    this.store.dispatch(selectDate({ date }));
  }

  addTripForDate(): void {
    const date = this.selectedDate();
    const queryParams = date ? { date } : {};
    this.router.navigate(['/admin/trips/new'], { queryParams });
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
      },
    });
  }

  openDetail(trip: Trip): void {
    this.detailHeader = `${trip.departureCity} → ${trip.arrivalCity}  ·  ${this.localDate.transform(trip.date)}`;
    this.detailActiveTab = 'dogs';
    this.detailTripId.set(trip.id);
    this.store.dispatch(loadTripById({ id: trip.id }));
    this.store.dispatch(loadRequests());
    this.detailDialogVisible = true;
  }

  onExportPdfFromCard(trip: Trip): void {
    this.exportService.exportTripById(trip.id);
  }

  closeDetail(): void {
    this.detailTripId.set(null);
    this.dogEditVisible = false;
  }

  onEditDog(event: { dog: Dog; tripId: string }): void {
    this.dogEditValues = { ...event.dog };
    this.dogEditTripId = event.tripId;
    this.dogEditVisible = true;
  }

  onSaveDog(dogs: Dog[]): void {
    if (!this.dogEditTripId || !dogs.length) return;
    this.store.dispatch(updateDog({ tripId: this.dogEditTripId, dog: dogs[0] }));
    this.dogEditVisible = false;
  }

  onCancelDog(): void {
    this.dogEditVisible = false;
    this.dogEditValues = null;
  }

  onDeleteDog(event: { dog: Dog; tripId: string }): void {
    this.confirmationService.confirm({
      header: 'Delete Dog',
      message: `Remove <strong>${sanitizeHtml(event.dog.name)}</strong> from this trip? This cannot be undone.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(deleteDog({ tripId: event.tripId, dogId: event.dog.id }));
      },
    });
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
        this.store.dispatch(rejectRequest({ id: req.id }));
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
      },
    });
  }
}
