import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule],
  template: `
    <div class="stats">
      <p-card styleClass="stat-card">
        <div class="stat-content flex align-items-center">
          <i class="pi pi-car stat-icon"></i>
          <div>
            <span class="stat-value">{{ totalTrips }}</span>
            <span class="stat-label">Total Trips</span>
          </div>
        </div>
      </p-card>
      <p-card styleClass="stat-card upcoming">
        <div class="stat-content flex align-items-center">
          <i class="pi pi-calendar stat-icon"></i>
          <div>
            <span class="stat-value">{{ upcomingTrips }}</span>
            <span class="stat-label">Upcoming</span>
          </div>
        </div>
      </p-card>
      <p-card styleClass="stat-card done">
        <div class="stat-content flex align-items-center">
          <i class="pi pi-check-circle stat-icon"></i>
          <div>
            <span class="stat-value">{{ completedTrips }}</span>
            <span class="stat-label">Completed</span>
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    .stat-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .stat-icon {
      font-size: 1.75rem;
      color: #e07b54;
      flex-shrink: 0;
    }
    .stat-content > div {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
    }
    .stat-label {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 500;
    }
    @media (max-width: 640px) {
      .stats { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardStatsComponent {
  @Input() totalTrips: number = 0;
  @Input() upcomingTrips: number = 0;
  @Input() completedTrips: number = 0;
}
