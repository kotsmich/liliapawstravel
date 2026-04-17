import { Component, ChangeDetectionStrategy, inject, input, output, model, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { AccordionModule } from 'primeng/accordion';
import { TranslocoModule } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { TableConfig } from '@models/lib/table-column.interface';
import { DogsTableComponent } from '@admin/features/trips/components/dogs-table.component';
import { DogsByRequestorComponent } from '@admin/features/trips/components/dogs-by-requestor/dogs-by-requestor.component';
import { DogFormDialogWrapperComponent } from '@admin/features/trips/components/dog-form-dialog-wrapper/dog-form-dialog-wrapper.component';
import { EmptyStateComponent } from '@ui/lib/components/empty-state/empty-state.component';
import { DogManagerService } from '@admin/features/trips/trip-form/dog-manager.service';

@Component({
  selector: 'app-trip-dogs-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule, TabsModule, TagModule, AccordionModule, TranslocoModule,
    DogsTableComponent, DogsByRequestorComponent,
    DogFormDialogWrapperComponent, EmptyStateComponent,
  ],
  templateUrl: './trip-dogs-tabs.component.html',
  styleUrl: './trip-dogs-tabs.component.scss',
})
export class TripDogsTabsComponent {
  readonly dogManager = inject(DogManagerService);

  readonly tripId = input<string | null>(null);
  readonly activeTab = model('all');
  readonly showAddButton = input(false);
  readonly showExportPdf = input(false);
  readonly tableSelectable = input(false);
  readonly requests = input<TripRequest[]>([]);

  readonly rowClicked = output<Dog>();
  readonly exportPdf = output<void>();

  readonly tableConfig = computed((): TableConfig => ({
    paginator: false,
    striped: true,
    trackByField: '_idx',
    selectable: this.tableSelectable(),
    emptyMessage: this.tableSelectable() ? 'No dogs added yet. Use the "Add Dog" button above.' : undefined,
  }));

  onTabChange(tab: string | undefined): void {
    this.activeTab.set(tab ?? 'all');
    this.dogManager.clearGroupSelections();
  }
}
