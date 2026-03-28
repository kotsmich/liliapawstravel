import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Store } from '@ngrx/store';
import { TripActions, selectAllTrips, selectTripsIsLoading } from '@myorg/store';
import { LoadingSpinnerComponent } from '@myorg/ui';
import { Trip } from '@myorg/models';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, TagModule, TableModule, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private store = inject(Store);

  trips$ = this.store.select(selectAllTrips);
  loading$ = this.store.select(selectTripsIsLoading);

  upcoming$ = this.trips$.pipe(map((t) => t.filter((x) => x.status === 'upcoming')));
  completed$ = this.trips$.pipe(map((t) => t.filter((x) => x.status === 'completed')));
  recentTrips$ = this.trips$.pipe(map((t) => t.slice(0, 5)));

  ngOnInit(): void {
    this.store.dispatch(TripActions.loadTrips());
  }

  statusSeverity(status: Trip['status']): 'info' | 'success' | 'secondary' {
    return status === 'upcoming' ? 'info' : status === 'completed' ? 'success' : 'secondary';
  }
}
