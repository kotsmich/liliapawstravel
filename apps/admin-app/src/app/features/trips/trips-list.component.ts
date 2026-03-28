import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { Store } from '@ngrx/store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { combineLatest, map } from 'rxjs';
import { TripActions, CalendarActions, selectAllTrips, selectTripsIsLoading, selectCalendarSelectedDate, selectTripsAsCalendarEvents } from '@myorg/store';
import { LoadingSpinnerComponent, TripCalendarComponent } from '@myorg/ui';
import { Trip } from '@myorg/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-trips-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, TagModule, ConfirmDialogModule, ToastModule, TableModule, LoadingSpinnerComponent, TripCalendarComponent],
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.scss'],
})
export class TripsListComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  trips$ = this.store.select(selectAllTrips);
  loading$ = this.store.select(selectTripsIsLoading);
  selectedDate$ = this.store.select(selectCalendarSelectedDate);

  // Derived from trips store — updates automatically when any trip is edited.
  calendarEvents$ = this.store.select(selectTripsAsCalendarEvents);

  tripsForDate$ = combineLatest([
    this.store.select(selectAllTrips),
    this.store.select(selectCalendarSelectedDate),
  ]).pipe(map(([trips, date]) => (date ? trips.filter((t: Trip) => t.date === date) : [])));

  selectedDate: string | null = null;
  activeTab: 'calendar' | 'all' = 'calendar';

  constructor() {
    this.selectedDate$.pipe(takeUntilDestroyed()).subscribe((d) => { this.selectedDate = d; });
  }

  ngOnInit(): void {
    this.store.dispatch(TripActions.loadTrips());
    // Default-select today so the panel below the calendar shows today's trips immediately.
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

  statusSeverity(status: Trip['status']): 'info' | 'success' | 'secondary' {
    return status === 'upcoming' ? 'info' : status === 'completed' ? 'success' : 'secondary';
  }
}
