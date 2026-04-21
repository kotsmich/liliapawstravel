import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslocoService } from '@jsverse/transloco';
import { MessageService } from 'primeng/api';
import { TripRequest } from '@models/lib/trip-request.model';
import { ConfirmActionService } from '@admin/shared/services/confirm-action.service';
import { sanitizeHtml } from '@admin/shared/utils/sanitize';
import {
  approveRequest, rejectRequest,
  bulkApproveRequests, bulkRejectRequests,
} from '@admin/features/requests/store';

@Injectable({ providedIn: 'root' })
export class RequestsApprovalService {
  private readonly store = inject(Store);
  private readonly confirm = inject(ConfirmActionService);
  private readonly transloco = inject(TranslocoService);
  private readonly messageService = inject(MessageService);

  approve(req: TripRequest, tripDateLabel: string, onAccepted?: () => void): void {
    if (!req.tripId) return;
    this.confirm.confirm({
      header:      this.transloco.translate('requests.confirm.approve.header'),
      message:     this.transloco.translate('requests.confirm.approve.message', {
        trip:      sanitizeHtml(tripDateLabel),
        requester: sanitizeHtml(req.requesterName),
      }),
      acceptLabel: this.transloco.translate('common.approve'),
      rejectLabel: this.transloco.translate('common.back'),
      severity:    'success',
      accept: () => {
        this.store.dispatch(approveRequest({ requestId: req.id, tripId: req.tripId! }));
        onAccepted?.();
      },
    });
  }

  reject(req: TripRequest, tripDateLabel: string, onAccepted?: () => void): void {
    this.confirm.confirm({
      header:      this.transloco.translate('requests.confirm.reject.header'),
      message:     this.transloco.translate('requests.confirm.reject.message', {
        trip:      sanitizeHtml(tripDateLabel),
        requester: sanitizeHtml(req.requesterName),
      }),
      acceptLabel: this.transloco.translate('common.reject'),
      rejectLabel: this.transloco.translate('common.back'),
      severity:    'danger',
      accept: () => {
        this.store.dispatch(rejectRequest({ id: req.id }));
        onAccepted?.();
      },
    });
  }

  bulkApprove(requests: TripRequest[]): void {
    if (!requests.length) {
      this.messageService.add({ severity: 'warn', summary: 'Nothing to approve', detail: 'Select pending requests assigned to a trip.' });
      return;
    }
    this.confirm.confirm({
      header:      this.transloco.translate('requests.confirm.bulkApprove.header'),
      message:     this.transloco.translate('requests.confirm.bulkApprove.message', { count: requests.length }),
      acceptLabel: this.transloco.translate('requests.confirm.bulkApprove.accept'),
      severity:    'success',
      accept: () => this.store.dispatch(bulkApproveRequests({ ids: requests.map((r) => r.id) })),
    });
  }

  bulkReject(requests: TripRequest[]): void {
    if (!requests.length) {
      this.messageService.add({ severity: 'warn', summary: 'Nothing to reject', detail: 'Select pending requests to reject.' });
      return;
    }
    this.confirm.confirm({
      header:      this.transloco.translate('requests.confirm.bulkReject.header'),
      message:     this.transloco.translate('requests.confirm.bulkReject.message', { count: requests.length }),
      acceptLabel: this.transloco.translate('requests.confirm.bulkReject.accept'),
      severity:    'danger',
      accept: () => this.store.dispatch(bulkRejectRequests({ ids: requests.map((r) => r.id) })),
    });
  }
}
