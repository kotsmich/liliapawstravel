import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { StatusTabComponent } from '@admin/shared/components/status-tab/status-tab.component';

@Component({
  selector: 'app-requests-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, SelectModule, TabsModule, BadgeModule, TranslocoModule, StatusTabComponent],
  templateUrl: './requests-filter.component.html',
  styles: [`
    .trip-option { display: flex; align-items: center; gap: 0.5rem; }
  `],
})
export class RequestsFilterComponent {
  readonly tripOptions = input<Array<{ label: string; value: string | null; pending: number }>>([]);
  readonly selectedTripId = input<string | null>(null);
  readonly activeTab = input<string>('all');
  readonly pendingCount = input<number>(0);
  readonly approvedCount = input<number>(0);
  readonly rejectedCount = input<number>(0);
  readonly cancelledCount = input<number>(0);

  readonly tripSelected = output<string | null>();
  readonly tabChanged = output<string>();
}
