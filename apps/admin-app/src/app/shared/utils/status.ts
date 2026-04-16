import { TranslocoService } from '@jsverse/transloco';

// ── Request status ─────────────────────────────────────────────────────────────

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export function requestStatusSeverity(status: RequestStatus): 'warn' | 'success' | 'danger' | 'secondary' {
  if (status === 'pending')  return 'warn';
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'danger';
  return 'secondary';
}

export function requestStatusLabel(status: RequestStatus, transloco: TranslocoService): string {
  if (status === 'pending')  return transloco.translate('requests.pending');
  if (status === 'approved') return transloco.translate('requests.approved');
  if (status === 'rejected') return transloco.translate('requests.rejected');
  return transloco.translate('requests.cancelled');
}

// ── Trip status ────────────────────────────────────────────────────────────────

export type TripStatus = 'upcoming' | 'in-progress' | 'completed';

export function tripStatusSeverity(status: TripStatus): 'info' | 'success' | 'secondary' {
  if (status === 'upcoming')  return 'info';
  if (status === 'completed') return 'success';
  return 'secondary';
}

export function tripStatusLabel(status: TripStatus, transloco: TranslocoService): string {
  if (status === 'upcoming')  return transloco.translate('trips.tags.upcoming');
  if (status === 'completed') return transloco.translate('trips.tags.completed');
  return transloco.translate('trips.tags.inProgress');
}
