import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'ui-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressSpinnerModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
})
export class LoadingSpinnerComponent {
  @Input() diameter = 40;
  @Input() message = '';
  @Input() overlay = false;
}
