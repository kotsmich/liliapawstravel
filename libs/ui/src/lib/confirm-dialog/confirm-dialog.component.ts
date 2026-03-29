import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onAccept: () => void;
}

@Component({
  selector: 'ui-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule, ButtonModule],
  template: `<p-confirmdialog />`,
})
export class ConfirmDialogComponent {
  constructor(private confirmationService: ConfirmationService) {}

  confirm(opts: ConfirmOptions): void {
    this.confirmationService.confirm({
      header: opts.title,
      message: opts.message,
      acceptLabel: opts.confirmLabel ?? 'Confirm',
      rejectLabel: opts.cancelLabel ?? 'Cancel',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      accept: opts.onAccept,
    });
  }
}
