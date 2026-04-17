import { Component, OnInit, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { loadTrips, selectAllTrips, selectTripsIsLoading } from '@admin/features/trips/store';
import { LoadingSpinnerComponent } from '@ui/lib/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@ui/lib/components/page-header/page-header.component';
import { Trip } from '@models/lib/trip.model';
import { DashboardStatsComponent } from './components/dashboard-stats/dashboard-stats.component';
import { RecentTripsComponent } from './components/recent-trips/recent-trips.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, LoadingSpinnerComponent, PageHeaderComponent, DashboardStatsComponent, RecentTripsComponent, TranslocoModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly trips = toSignal(this.store.select(selectAllTrips), { initialValue: [] as Trip[] });
  readonly loading = toSignal(this.store.select(selectTripsIsLoading), { initialValue: false });

  readonly totalTrips = computed(() => this.trips().length);
  readonly upcomingCount = computed(() => this.trips().filter((trip) => trip.status === 'upcoming').length);
  readonly completedCount = computed(() => this.trips().filter((trip) => trip.status === 'completed').length);
  readonly recentTrips = computed(() => this.trips().slice(0, 5));

  ngOnInit(): void {
    this.store.dispatch(loadTrips());
  }

  navigateToAllTrips(): void { this.router.navigate(['/admin/trips']); }
  navigateToNewTrip(): void { this.router.navigate(['/admin/trips/new']); }
  onViewTrip(trip: Trip): void { this.router.navigate(['/admin/trips', trip.id, 'edit']); }
}
