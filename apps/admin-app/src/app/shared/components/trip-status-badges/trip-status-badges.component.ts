import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TranslocoModule } from '@jsverse/transloco';
import { Trip } from '@models/lib/trip.model';
import { tripStatusSeverity } from '@admin/shared/utils/status';

@Component({
  selector: 'app-trip-status-badges',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TagModule, TranslocoModule],
  templateUrl: './trip-status-badges.component.html',
})
export class TripStatusBadgesComponent {
  readonly trip = input.required<Trip>();

  readonly statusSeverity = computed(() => tripStatusSeverity(this.trip().status));
}
