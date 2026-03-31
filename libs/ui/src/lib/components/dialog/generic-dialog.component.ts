import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DialogConfig } from '@models/lib/dialog-config.interface';

@Component({
  selector: 'app-generic-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './generic-dialog.component.html',
  styleUrl: './generic-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericDialogComponent {
  @Input() visible = false;
  @Input() config: DialogConfig = { title: '' };
  @Input() loading = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onHide(): void {
    this.visibleChange.emit(false);
    this.cancelled.emit();
  }

  onConfirm(): void {
    this.confirmed.emit();
  }
}
