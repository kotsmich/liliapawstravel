import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Store } from '@ngrx/store';
import { TripActions, selectAllTrips, selectTripsIsLoading } from '@admin/store/trips';
import { LoadingSpinnerComponent } from '@ui/lib/loading-spinner/loading-spinner.component';
import { Trip } from '@models/lib/trip.model';
import { map } from 'rxjs/operators';
import { DashboardStatsComponent } from './components/dashboard-stats/dashboard-stats.component';
import { RecentTripsComponent } from './components/recent-trips/recent-trips.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, LoadingSpinnerComponent, DashboardStatsComponent, RecentTripsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(private store: Store, private router: Router) {}

  trips$ = this.store.select(selectAllTrips) as import('rxjs').Observable<Trip[]>;
  loading$ = this.store.select(selectTripsIsLoading);

  totalTrips$ = this.trips$.pipe(map((t) => t.length));
  upcomingCount$ = this.trips$.pipe(map((t) => t.filter((x) => x.status === 'upcoming').length));
  completedCount$ = this.trips$.pipe(map((t) => t.filter((x) => x.status === 'completed').length));
  recentTrips$ = this.trips$.pipe(map((t) => t.slice(0, 5)));

  ngOnInit(): void {
    this.store.dispatch(TripActions.loadTrips());
  }

  navigateToAllTrips(): void { this.router.navigate(['/admin/trips']); }
  navigateToNewTrip(): void { this.router.navigate(['/admin/trips/new']); }
  onViewTrip(trip: Trip): void { this.router.navigate(['/admin/trips', trip.id, 'edit']); }
}
