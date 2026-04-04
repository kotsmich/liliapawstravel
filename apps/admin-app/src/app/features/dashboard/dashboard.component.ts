import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Store } from '@ngrx/store';
import { loadTrips, selectAllTrips, selectTripsIsLoading } from '@admin/features/trips/store';
import { LoadingSpinnerComponent } from '@ui/lib/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@ui/lib/components/page-header/page-header.component';
import { Trip } from '@models/lib/trip.model';
import { map } from 'rxjs/operators';
import { DashboardStatsComponent } from './components/dashboard-stats/dashboard-stats.component';
import { RecentTripsComponent } from './components/recent-trips/recent-trips.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, ButtonModule, LoadingSpinnerComponent, PageHeaderComponent, DashboardStatsComponent, RecentTripsComponent, TranslocoModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  trips$ = this.store.select(selectAllTrips);
  loading$ = this.store.select(selectTripsIsLoading);

  totalTrips$ = this.trips$.pipe(map((t: Trip[]) => t.length));
  upcomingCount$ = this.trips$.pipe(map((t: Trip[]) => t.filter((x) => x.status === 'upcoming').length));
  completedCount$ = this.trips$.pipe(map((t: Trip[]) => t.filter((x) => x.status === 'completed').length));
  recentTrips$ = this.trips$.pipe(map((t: Trip[]) => t.slice(0, 5)));

  ngOnInit(): void {
    this.store.dispatch(loadTrips());
  }

  navigateToAllTrips(): void { this.router.navigate(['/admin/trips']); }
  navigateToNewTrip(): void { this.router.navigate(['/admin/trips/new']); }
  onViewTrip(trip: Trip): void { this.router.navigate(['/admin/trips', trip.id, 'edit']); }
}
