import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslocoService } from '@jsverse/transloco';
import { TripRequest } from '@models/lib/trip-request.model';
import { ConfirmActionService } from '@admin/shared/services/confirm-action.service';
import { sanitizeHtml } from '@admin/shared/utils/sanitize';
import {
  approveRequest, rejectRequest,
  bulkApproveRequests, bulkRejectRequests,
  bulkApproveRequestsNoSelection, bulkRejectRequestsNoSelection,
} from '@admin/features/requests/store';

@Injectable({ providedIn: 'root' })
export class RequestsApprovalService {
  private readonly store = inject(Store);
  private readonly confirm = inject(ConfirmActionService);
  private readonly transloco = inject(TranslocoService);

  approve(req: TripRequest, tripDateLabel: string, onAccepted?: () => void): void {
    if (!req.tripId) return;
    const trip = sanitizeHtml(tripDateLabel);
    const requester = sanitizeHtml(req.requesterName);
    this.confirm.confirm({
      header:      'Επιβεβαίωση Έγκρισης',
      message:     `Έγκριση αιτήματος για ταξίδι ${trip} από ${requester};`,
      acceptLabel: 'Έγκριση',
      rejectLabel: 'Πίσω',
      severity:    'success',
      accept: () => {
        this.store.dispatch(approveRequest({ requestId: req.id, tripId: req.tripId! }));
        onAccepted?.();
      },
    });
  }

  reject(req: TripRequest, tripDateLabel: string, onAccepted?: () => void): void {
    const trip = sanitizeHtml(tripDateLabel);
    const requester = sanitizeHtml(req.requesterName);
    this.confirm.confirm({
      header:      'Επιβεβαίωση Απόρριψης',
      message:     `Απόρριψη αιτήματος για ταξίδι ${trip} από ${requester}; Αυτό δεν μπορεί να αναιρεθεί.`,
      acceptLabel: 'Απόρριψη',
      rejectLabel: 'Πίσω',
      severity:    'danger',
      accept: () => {
        this.store.dispatch(rejectRequest({ id: req.id }));
        onAccepted?.();
      },
    });
  }

  bulkApprove(requests: TripRequest[]): void {
    if (!requests.length) {
      this.store.dispatch(bulkApproveRequestsNoSelection());
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
      this.store.dispatch(bulkRejectRequestsNoSelection());
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
