import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Trip } from '@models/lib/trip.model';

@Component({
  selector: 'app-all-trips-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, TagModule, ButtonModule, TooltipModule],
  templateUrl: './all-trips-tab.component.html',
  styleUrls: ['./all-trips-tab.component.scss'],
})
export class AllTripsTabComponent {
  @Input() trips: Trip[] = [];
  @Output() editTrip = new EventEmitter<Trip>();
  @Output() deleteTrip = new EventEmitter<Trip>();
  @Output() viewDetails = new EventEmitter<Trip>();

  trackByTripId(_: number, trip: Trip): string { return trip.id; }

  statusSeverity(status: Trip['status']): 'info' | 'success' | 'secondary' {
    return status === 'upcoming' ? 'info' : status === 'completed' ? 'success' : 'secondary';
  }
}
