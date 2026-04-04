import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef, inject } from '@angular/core';
import { Dog } from '@models/lib/dog.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

@Component({
  selector: 'app-dogs-table',
  standalone: true,
  imports: [GenericTableComponent],
  template: `
    <app-generic-table
      [data]="dogs"
      [columns]="columns"
      [actions]="actions"
      [config]="config"
      [selection]="selectedDogs"
      (selectionChange)="onSelectionChange($any($event))" />
  `,
  styles: [':host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow-y: auto; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DogsTableComponent {
  @Input() set dogs(val: (Dog & { _idx: number })[]) {
    this._dogs = val;
    this.selectedDogs = [];
    this.selectionChange.emit([]);
  }
  get dogs(): (Dog & { _idx: number })[] { return this._dogs; }

  @Input() columns: TableColumn<Dog & { _idx: number }>[] = [];
  @Input() actions: TableAction<Dog & { _idx: number }>[] = [];
  @Input() config: TableConfig = {};

  @Output() selectionChange = new EventEmitter<(Dog & { _idx: number })[]>();

  selectedDogs: (Dog & { _idx: number })[] = [];
  private _dogs: (Dog & { _idx: number })[] = [];
  private readonly cdr = inject(ChangeDetectorRef);

  onSelectionChange(dogs: (Dog & { _idx: number })[]): void {
    this.selectedDogs = dogs;
    this.selectionChange.emit(dogs);
    this.cdr.markForCheck();
  }
}
