import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CONTACT_INFO } from '@user/shared/contact-info';

@Component({
  selector: 'app-trip-request-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './trip-request-sidebar.component.html',
  styleUrls: ['./trip-request-sidebar.component.scss'],
})
export class TripRequestSidebarComponent {
  readonly contact = CONTACT_INFO;
  readonly stepIndices = [1, 2, 3, 4] as const;
}
