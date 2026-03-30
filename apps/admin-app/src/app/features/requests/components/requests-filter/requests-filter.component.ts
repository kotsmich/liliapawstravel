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
  template: `
    <!-- Trip filter -->
    <div class="filter-bar">
      <p-select
        [options]="tripOptions"
        [ngModel]="selectedTripId"
        (ngModelChange)="tripSelected.emit($event)"
        optionLabel="label"
        optionValue="value"
        placeholder="All Trips"
        styleClass="trip-select"
        />
    </div>
    
    <!-- Status tabs -->
    <p-tabs [value]="activeTab" (valueChange)="tabChanged.emit($event?.toString() ?? activeTab)">
      <p-tablist>
        <p-tab value="all">All</p-tab>
        <p-tab value="pending">
          Pending
          @if (pendingCount > 0) {
            <p-badge
              [value]="pendingCount.toString()"
              severity="warn"
              class="tab-badge"
              />
          }
        </p-tab>
        <p-tab value="approved">
          Approved
          @if (approvedCount > 0) {
            <p-badge
              [value]="approvedCount.toString()"
              severity="success"
              class="tab-badge"
              />
          }
        </p-tab>
        <p-tab value="rejected">
          Rejected
          @if (rejectedCount > 0) {
            <p-badge
              [value]="rejectedCount.toString()"
              severity="danger"
              class="tab-badge"
              />
          }
        </p-tab>
      </p-tablist>
    </p-tabs>
    `,
  styles: [],
})
export class RequestsFilterComponent {
  @Input() tripOptions: Array<{ label: string; value: string | null }> = [];
  @Input() selectedTripId: string | null = null;
  @Input() activeTab: string = 'all';
  @Input() pendingCount: number = 0;
  @Input() approvedCount: number = 0;
  @Input() rejectedCount: number = 0;

  @Output() tripSelected = new EventEmitter<string | null>();
  @Output() tabChanged = new EventEmitter<string>();
}
