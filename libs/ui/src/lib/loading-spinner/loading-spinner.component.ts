import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'ui-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressSpinnerModule],
  template: `
    <div class="spinner-wrap" [class.overlay]="overlay">
      <p-progressspinner [style]="{ width: diameter + 'px', height: diameter + 'px' }" strokeWidth="4" />
      @if (message) {
        <p class="spinner-msg">{{ message }}</p>
      }
    </div>
    `,
  styles: [`
    .spinner-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
    }
    .spinner-wrap.overlay {
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,0.8);
      /* z-index: above all page content but below PrimeNG dialogs (1100) */
      z-index: 9999;
    }
    .spinner-msg { color: var(--p-primary-800, #7a6358); font-size: 0.95rem; }
  `],
})
export class LoadingSpinnerComponent {
  @Input() diameter = 40;
  @Input() message = '';
  @Input() overlay = false;
}
