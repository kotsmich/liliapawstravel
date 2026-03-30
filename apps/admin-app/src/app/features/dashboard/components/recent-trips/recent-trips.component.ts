import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { Trip } from '@myorg/models';

@Component({
  selector: 'app-recent-trips',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, TableModule, TagModule, ButtonModule],
  template: `
    <p-card styleClass="recent-card">
      <ng-template pTemplate="header">
        <div class="card-header flex align-items-center justify-content-between">
          <span class="card-title">Recent Trips</span>
          <p-button label="View All" [text]="true" (onClick)="navigateToAllTrips.emit()" />
        </div>
      </ng-template>

      <p-table [value]="trips" [tableStyle]="{ 'min-width': '50rem' }">
        <ng-template pTemplate="header">
          <tr>
            <th>Route</th>
            <th>Date</th>
            <th>Dogs</th>
            <th>Status</th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-trip>
          <tr>
            <td>
              <strong>{{ trip.departureCity }}, {{ trip.departureCountry }}</strong>
              <span class="arrow"> → </span>
              {{ trip.arrivalCity }}, {{ trip.arrivalCountry }}
            </td>
            <td>{{ trip.date }}</td>
            <td>{{ trip.dogs?.length ?? 0 }}</td>
            <td>
              <p-tag [value]="trip.status" [severity]="statusSeverity(trip.status)" />
            </td>
            <td>
              <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small"
                (onClick)="viewTrip.emit(trip)" />
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="5" class="empty">No trips yet.</td></tr>
        </ng-template>
      </p-table>
    </p-card>
  `,
  styles: [],
})
export class RecentTripsComponent {
  @Input() trips: Trip[] = [];
  @Output() viewTrip = new EventEmitter<Trip>();
  @Output() navigateToAllTrips = new EventEmitter<void>();

  statusSeverity(status: Trip['status']): 'info' | 'success' | 'secondary' {
    return status === 'upcoming' ? 'info' : status === 'completed' ? 'success' : 'secondary';
  }
}
