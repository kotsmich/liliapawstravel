import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-no-trip-hint',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './no-trip-hint.component.html',
  styleUrls: ['./no-trip-hint.component.scss'],
})
export class NoTripHintComponent {}
