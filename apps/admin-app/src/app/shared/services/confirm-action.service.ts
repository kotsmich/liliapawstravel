import { Injectable, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { TranslocoService } from '@jsverse/transloco';

export interface ConfirmActionParams {
  header: string;
  message: string;
  acceptLabel: string;
  rejectLabel?: string;
  severity: 'danger' | 'success';
  accept: () => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmActionService {
  private readonly confirmation = inject(ConfirmationService);
  private readonly transloco = inject(TranslocoService);

  confirm(params: ConfirmActionParams): void {
    this.confirmation.confirm({
      header: params.header,
      message: params.message,
      acceptLabel: params.acceptLabel,
      rejectLabel: params.rejectLabel ?? this.transloco.translate('common.cancel'),
      acceptButtonStyleClass: `p-button-${params.severity}`,
      accept: params.accept,
    });
  }
}
