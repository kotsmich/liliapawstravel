import { Component } from '@angular/core';

import { ToastModule } from 'primeng/toast';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warn';

@Component({
  selector: 'ui-toast',
  standalone: true,
  imports: [ToastModule],
  template: `<p-toast position="top-right" [life]="4000" />`,
})
export class ToastNotificationComponent {}
