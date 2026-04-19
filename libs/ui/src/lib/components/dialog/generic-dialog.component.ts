import { Component, ChangeDetectionStrategy, model, input, output } from '@angular/core';
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
  readonly visible = model(false);
  readonly config = input<DialogConfig>({ title: '' });
  readonly loading = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onHide(): void {
    this.visible.set(false);
    this.cancelled.emit();
  }

  onConfirm(): void {
    this.confirmed.emit();
  }
}
