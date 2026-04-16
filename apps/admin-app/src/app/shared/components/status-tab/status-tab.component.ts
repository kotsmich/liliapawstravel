import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { TranslocoModule } from '@jsverse/transloco';

/**
 * Renders one `<p-tab>` with an optional count badge.
 * Extracted from requests-filter.component.html where the same p-tab +
 * conditional p-badge pattern repeated five times.
 *
 * `:host { display: contents }` makes the wrapper transparent to PrimeNG's
 * TabList so the inner p-tab is registered correctly in the injection tree.
 */
@Component({
  selector: 'app-status-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TabsModule, BadgeModule, TranslocoModule],
  template: `
    <p-tab [value]="value()">
      {{ labelKey() | transloco }}
      @if (count() > 0) {
        <p-badge [value]="count().toString()" [severity]="severity()" class="tab-badge" />
      }
    </p-tab>
  `,
  styles: [`:host { display: contents; }`],
})
export class StatusTabComponent {
  /** The tab's value — must match the value used in p-tabs [value] binding. */
  readonly value = input.required<string>();
  /** Transloco key for the tab label. */
  readonly labelKey = input.required<string>();
  /** Badge count. Badge is hidden when 0 (default). */
  readonly count = input<number>(0);
  /** PrimeNG badge severity. */
  readonly severity = input<'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'>('warn');
}
