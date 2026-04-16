import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { TranslocoModule } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';
import { TripRequester } from '@models/lib/trip.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { DogsTableComponent } from '../dogs-table.component';

@Component({
  selector: 'app-dogs-by-requestor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AccordionModule,
    TranslocoModule,
    DogsTableComponent,
  ],
  templateUrl: './dogs-by-requestor.component.html',
  styleUrl: './dogs-by-requestor.component.scss',
})
export class DogsByRequestorComponent {
  readonly requestors = input<TripRequester[]>([]);
  readonly dogsPerRequestor = input<Map<string, (Dog & { _idx: number })[]>>(new Map());
  readonly dogColumns = input<TableColumn<Dog & { _idx: number }>[]>([]);
  readonly dogActions = input<TableAction<Dog & { _idx: number }>[]>([]);
  readonly tableConfig = input<TableConfig>({});
  readonly requests = input<TripRequest[]>([]);

  readonly selectionChange = output<{ dogs: (Dog & { _idx: number })[]; groupKey: string }>();
  readonly rowClicked = output<Dog>();
}
