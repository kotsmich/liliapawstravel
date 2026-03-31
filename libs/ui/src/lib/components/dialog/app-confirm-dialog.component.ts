import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
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
  @Input() visible = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'Confirm';
  @Input() severity: 'danger' | 'warning' = 'danger';
  @Input() loading = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
