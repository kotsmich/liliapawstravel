import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warn';

@Component({
  selector: 'ui-toast',
  standalone: true,
  imports: [CommonModule, ToastModule],
  template: `<p-toast position="top-right" [life]="4000" />`,
})
export class ToastNotificationComponent {}
