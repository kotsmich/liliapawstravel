import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { TripRequest } from '@models/lib/trip-request.model';
import { requestStatusSeverity, requestStatusLabel, RequestStatus } from '@admin/shared/utils/status';

@Component({
  selector: 'app-request-info-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TagModule, TranslocoModule],
  templateUrl: './request-info-grid.component.html',
  styleUrl: './request-info-grid.component.scss',
})
export class RequestInfoGridComponent {
  readonly req = input.required<TripRequest>();
  readonly tripDateLabel = input.required<string>();

  readonly requestStatusSeverity = requestStatusSeverity;

  private readonly transloco = inject(TranslocoService);
  readonly requestStatusLabel = (status: RequestStatus) => requestStatusLabel(status, this.transloco);
}
