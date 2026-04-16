import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LocalDatePipe } from '@ui/lib/pipes/local-date.pipe';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Store } from '@ngrx/store';
import { of, switchMap } from 'rxjs';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { loadTrips, loadTripById, deleteTrip, selectAllTrips, selectTripsIsLoading, selectTripsAsCalendarEvents, selectTripsForSelectedDate, selectTripById } from '@admin/features/trips/store';
import { selectDate, selectCalendarSelectedDate } from '@admin/core/store/calendar';
import { loadRequests, approveRequest, rejectRequest, deleteRequest, selectRequestsByTripId } from '@admin/features/requests/store';
import { LoadingSpinnerComponent } from '@ui/lib/loading-spinner/loading-spinner.component';
import { Trip } from '@models/lib/trip.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { sanitizeHtml } from '@admin/shared/utils/sanitize';
import { ConfirmActionService } from '@admin/shared/services/confirm-action.service';
import { TripCalendarViewComponent } from '../components/trip-calendar-view/trip-calendar-view.component';
import { AllTripsTabComponent } from '../components/all-trips-tab/all-trips-tab.component';
import { TripDetailDialogComponent } from '../components/trip-detail-dialog/trip-detail-dialog.component';
import { TripManifestExportService } from '../../../services/trip-manifest-export.service';

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
    TranslocoModule,
  ],
  providers: [LocalDatePipe],
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.scss'],
})
export class TripsListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmActionService);
  private readonly transloco = inject(TranslocoService);
  private readonly exportService = inject(TripManifestExportService);
  private readonly localDate = inject(LocalDatePipe);

  trips$ = this.store.select(selectAllTrips);
  loading$ = this.store.select(selectTripsIsLoading);
  calendarEvents$ = this.store.select(selectTripsAsCalendarEvents);
  tripsForDate$ = this.store.select(selectTripsForSelectedDate);

  readonly selectedDate = toSignal(this.store.select(selectCalendarSelectedDate), { initialValue: null });
  readonly activeTab = signal<'calendar' | 'all'>('calendar');

  readonly detailDialogVisible = signal(false);
  readonly detailActiveTab = signal('dogs');
  readonly detailTripId = signal<string | null>(null);

  readonly detailTrip = toSignal(toObservable(this.detailTripId).pipe(
    switchMap((id) => id ? this.store.select(selectTripById(id)) : of(null))
  ), { initialValue: null as Trip | null });

  readonly detailHeader = computed(() => {
    const trip = this.detailTrip();
    if (!trip) return '';
    return `${trip.departureCity} → ${trip.arrivalCity}  ·  ${this.localDate.transform(trip.date)}`;
  });

  readonly detailRequests = toSignal(toObservable(this.detailTripId).pipe(
    switchMap((id) => id ? this.store.select(selectRequestsByTripId(id)) : of([]))
  ), { initialValue: [] as TripRequest[] });

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
    const route = `${sanitizeHtml(trip.departureCity)} → ${sanitizeHtml(trip.arrivalCity)}`;
    this.confirm.confirm({
      header:      this.transloco.translate('trips.confirm.deleteTrip.header'),
      message:     this.transloco.translate('trips.confirm.deleteTrip.message', { route, date: trip.date }),
      acceptLabel: this.transloco.translate('common.delete'),
      severity:    'danger',
      accept: () => this.store.dispatch(deleteTrip({ id: trip.id })),
    });
  }

  openDetail(trip: Trip): void {
    this.detailActiveTab.set('dogs');
    this.detailTripId.set(trip.id);
    this.store.dispatch(loadTripById({ id: trip.id }));
    this.store.dispatch(loadRequests());
    this.detailDialogVisible.set(true);
  }

  onExportPdfFromCard(trip: Trip): void {
    this.exportService.exportTripById(trip.id);
  }

  closeDetail(): void {
    this.detailTripId.set(null);
  }

  approveRequestInDetail(req: TripRequest): void {
    this.confirm.confirm({
      header:      this.transloco.translate('trips.confirm.approveRequest.header'),
      message:     this.transloco.translate('trips.confirm.approveRequest.message', {
        name:  sanitizeHtml(req.requesterName),
        count: req.dogs.length,
      }),
      acceptLabel: this.transloco.translate('common.approve'),
      rejectLabel: this.transloco.translate('common.back'),
      severity:    'success',
      accept: () => this.store.dispatch(approveRequest({ requestId: req.id, tripId: req.tripId! })),
    });
  }

  rejectRequestInDetail(req: TripRequest): void {
    this.confirm.confirm({
      header:      this.transloco.translate('trips.confirm.rejectRequest.header'),
      message:     this.transloco.translate('trips.confirm.rejectRequest.message', { name: sanitizeHtml(req.requesterName) }),
      acceptLabel: this.transloco.translate('common.reject'),
      rejectLabel: this.transloco.translate('common.back'),
      severity:    'danger',
      accept: () => this.store.dispatch(rejectRequest({ id: req.id })),
    });
  }

  deleteRequestInDetail(req: TripRequest): void {
    const msgKey = req.status === 'approved'
      ? 'trips.confirm.deleteRequest.messageApproved'
      : 'trips.confirm.deleteRequest.message';
    this.confirm.confirm({
      header:      this.transloco.translate('trips.confirm.deleteRequest.header'),
      message:     this.transloco.translate(msgKey, { name: sanitizeHtml(req.requesterName) }),
      acceptLabel: this.transloco.translate('common.delete'),
      severity:    'danger',
      accept: () => this.store.dispatch(deleteRequest({ requestId: req.id })),
    });
  }
}
