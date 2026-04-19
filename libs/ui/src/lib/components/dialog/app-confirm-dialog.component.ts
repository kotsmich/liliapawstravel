import { Component, ChangeDetectionStrategy, model, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDialogComponent } from './generic-dialog.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, GenericDialogComponent],
  templateUrl: './app-confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppConfirmDialogComponent {
  readonly visible = model(false);
  readonly title = input('Confirm Action');
  readonly message = input('Are you sure?');
  readonly confirmLabel = input('Confirm');
  readonly severity = input<'danger' | 'warning'>('danger');
  readonly loading = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
