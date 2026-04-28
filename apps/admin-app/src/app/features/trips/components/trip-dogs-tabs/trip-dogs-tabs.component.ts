import { Component, ChangeDetectionStrategy, inject, input, output, model, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TranslocoModule } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { TableConfig } from '@models/lib/table-column.interface';
import { DogsTableComponent } from '@admin/features/trips/components/dogs-table.component';
import { DogsByGroupComponent } from '@admin/features/trips/components/dogs-grouped/dogs-grouped.component';
import { DogFormDialogWrapperComponent } from '@admin/features/trips/components/dog-form-dialog-wrapper/dog-form-dialog-wrapper.component';
import { DogManagerService } from '@admin/features/trips/trip-form/dog-manager.service';
import { TripDogsExportPdfComponent } from './trip-dogs-export-pdf/trip-dogs-export-pdf.component';
import { TRIP_DOGS_DEFAULT_TAB, TripDogsTab } from './trip-dogs-tabs.constants';

@Component({
  selector: 'app-trip-dogs-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule, TabsModule, TagModule, TranslocoModule,
    DogsTableComponent, DogsByGroupComponent,
    DogFormDialogWrapperComponent, TripDogsExportPdfComponent,
  ],
  templateUrl: './trip-dogs-tabs.component.html',
  styleUrl: './trip-dogs-tabs.component.scss',
})
export class TripDogsTabsComponent {
  readonly dogManager = inject(DogManagerService);

  readonly tripId = input<string | null>(null);
  readonly activeTab = model(TRIP_DOGS_DEFAULT_TAB);
  readonly showAddButton = input(false);
  readonly showExportPdf = input(false);
  readonly tableSelectable = input(false);
  readonly requests = input<TripRequest[]>([]);

  readonly rowClicked = output<Dog>();

  readonly tableConfig = computed((): TableConfig => ({
    paginator: false,
    striped: true,
    trackByField: '_idx',
    selectable: this.tableSelectable(),
    emptyMessage: this.tableSelectable() ? 'No dogs added yet. Use the "Add Dog" button above.' : undefined,
    sortField: 'name',
    sortOrder: 1,
  }));

  onTabChange(tab: string | undefined): void {
    this.activeTab.set((tab as TripDogsTab) ?? TRIP_DOGS_DEFAULT_TAB);
    this.dogManager.clearGroupSelections();
  }
}
