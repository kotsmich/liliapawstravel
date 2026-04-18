import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { Dog } from '@models/lib/dog.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { DogGroup } from '@admin/features/trips/shared/dog-group.model';
import { DogsTableComponent } from '../dogs-table.component';
import { EmptyStateComponent } from '@ui/lib/components/empty-state/empty-state.component';

@Component({
  selector: 'app-dogs-grouped',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AccordionModule,
    TooltipModule,
    DogsTableComponent,
    EmptyStateComponent,
  ],
  templateUrl: './dogs-grouped.component.html',
  styleUrl: './dogs-grouped.component.scss',
})
export class DogsByGroupComponent {
  readonly groups = input<DogGroup[]>([]);
  readonly dogColumns = input<TableColumn<Dog & { _idx: number }>[]>([]);
  readonly dogActions = input<TableAction<Dog & { _idx: number }>[]>([]);
  readonly tableConfig = input<TableConfig>({});
  readonly emptyMessage = input('');
  readonly emptyStateIcon = input('');
  readonly emptyGroupMessage = input('');

  readonly selectionChange = output<{ dogs: (Dog & { _idx: number })[]; groupKey: string }>();
  readonly rowClicked = output<Dog>();
}
