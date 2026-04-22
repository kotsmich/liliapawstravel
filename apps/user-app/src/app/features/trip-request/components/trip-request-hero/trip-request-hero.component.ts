import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-trip-request-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './trip-request-hero.component.html',
  styleUrls: ['./trip-request-hero.component.scss'],
})
export class TripRequestHeroComponent {}
