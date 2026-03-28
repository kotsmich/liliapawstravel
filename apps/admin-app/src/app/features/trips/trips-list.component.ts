import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Store } from '@ngrx/store';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  TripActions, CalendarActions,
  selectAllTrips, selectTripsIsLoading, selectAllEvents, selectCalendarSelectedDate,
} from '@myorg/store';
import { LoadingSpinnerComponent, TripCalendarComponent } from '@myorg/ui';
import { Trip, CalendarEvent } from '@myorg/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-trips-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    CardModule, ButtonModule, TagModule, ConfirmDialogModule, ToastModule,
    LoadingSpinnerComponent, TripCalendarComponent,
  ],
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.scss'],
})
export class TripsListComponent implements OnInit {
  private store = inject(Store);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  trips$ = this.store.select(selectAllTrips);
  loading$ = this.store.select(selectTripsIsLoading);
  events$ = this.store.select(selectAllEvents);
  selectedDate$ = this.store.select(selectCalendarSelectedDate);

  calendarEvents: CalendarEvent[] = [];
  selectedDate: string | null = null;

  constructor() {
    this.events$.pipe(takeUntilDestroyed()).subscribe((e) => {
      this.calendarEvents = e as CalendarEvent[];
    });
    this.selectedDate$.pipe(takeUntilDestroyed()).subscribe((d) => {
      this.selectedDate = d;
    });
  }

  ngOnInit(): void {
    this.store.dispatch(TripActions.loadTrips());
    this.store.dispatch(CalendarActions.loadEvents());
  }

  onDateSelected(date: string): void {
    this.store.dispatch(CalendarActions.selectDate({ date }));
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
