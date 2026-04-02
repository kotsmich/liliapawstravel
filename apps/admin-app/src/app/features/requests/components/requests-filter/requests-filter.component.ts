import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-requests-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, SelectModule, TabsModule, BadgeModule],
  templateUrl: './requests-filter.component.html',
  styles: [`
    .trip-option { display: flex; align-items: center; gap: 0.5rem; }
  `],
})
export class RequestsFilterComponent {
  @Input() tripOptions: Array<{ label: string; value: string | null; pending: number }> = [];
  @Input() selectedTripId: string | null = null;
  @Input() activeTab: string = 'all';
  @Input() pendingCount: number = 0;
  @Input() approvedCount: number = 0;
  @Input() rejectedCount: number = 0;

  @Output() tripSelected = new EventEmitter<string | null>();
  @Output() tabChanged = new EventEmitter<string>();
}
