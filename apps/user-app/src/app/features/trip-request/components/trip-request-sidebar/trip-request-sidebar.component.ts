import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-trip-request-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './trip-request-sidebar.component.html',
  styleUrls: ['./trip-request-sidebar.component.scss'],
})
export class TripRequestSidebarComponent {}
