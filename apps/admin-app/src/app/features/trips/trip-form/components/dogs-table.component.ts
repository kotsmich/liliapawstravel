import { Component, ChangeDetectionStrategy, input, output, linkedSignal } from '@angular/core';
import { Dog } from '@models/lib/dog.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

@Component({
  selector: 'app-dogs-table',
  standalone: true,
  imports: [GenericTableComponent],
  template: `
    <app-generic-table
      [data]="dogs()"
      [columns]="columns()"
      [actions]="actions()"
      [config]="config()"
      [selection]="selectedDogs()"
      (selectionChange)="onSelectionChange($any($event))" />
  `,
  styles: [':host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow-y: auto; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DogsTableComponent {
  readonly dogs    = input<(Dog & { _idx: number })[]>([]);
  readonly columns = input<TableColumn<Dog & { _idx: number }>[]>([]);
  readonly actions = input<TableAction<Dog & { _idx: number }>[]>([]);
  readonly config  = input<TableConfig>({});

  readonly selectionChange = output<(Dog & { _idx: number })[]>();

  // Resets to [] whenever the dogs list changes; user selections override it via .set()
  readonly selectedDogs = linkedSignal<(Dog & { _idx: number })[]>(() => (this.dogs(), []));

  onSelectionChange(dogs: (Dog & { _idx: number })[]): void {
    this.selectedDogs.set(dogs);
    this.selectionChange.emit(dogs);
  }
}
