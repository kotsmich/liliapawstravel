import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule],
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss'],
})
export class DashboardStatsComponent {
  @Input() totalTrips: number = 0;
  @Input() upcomingTrips: number = 0;
  @Input() completedTrips: number = 0;
}
