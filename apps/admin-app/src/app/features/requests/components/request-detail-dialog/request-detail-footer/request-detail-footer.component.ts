import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';
import { RequestStatus } from '@admin/shared/utils/status';

@Component({
  selector: 'app-request-detail-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, TranslocoModule],
  templateUrl: './request-detail-footer.component.html',
})
export class RequestDetailFooterComponent {
  readonly status = input<RequestStatus | undefined>();

  readonly approve = output<void>();
  readonly reject = output<void>();
  readonly cancel = output<void>();
}
