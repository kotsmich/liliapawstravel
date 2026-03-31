import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, AvatarModule, TooltipModule],
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericTableComponent<T extends object> {
  tableData: T[] = [];

  @Input() set data(val: T[]) {
    this.tableData = val ? [...val] : [];
  }

  @Input() columns: TableColumn<T>[] = [];
  @Input() actions: TableAction<T>[] = [];
  @Input() config: TableConfig = {};
  @Input() loading = false;
  @Output() rowClicked = new EventEmitter<T>();
  @Output() selectionChanged = new EventEmitter<T[]>();

  trackByFn = (index: number, item: T): unknown => {
    const field = this.config.trackByField ?? 'id';
    return (item as Record<string, unknown>)[field] ?? index;
  };

  getCellValue(row: T, field: string): unknown {
    return field.split('.').reduce((obj: unknown, key: string) => {
      if (obj && typeof obj === 'object') {
        return (obj as Record<string, unknown>)[key];
      }
      return undefined;
    }, row as unknown);
  }

  getBadgeSeverity(col: TableColumn<T>, row: T): string {
    const value = this.getCellValue(row, col.field);
    return col.badgeConfig?.severity(value, row) ?? 'info';
  }

  getBadgeLabel(col: TableColumn<T>, row: T): string {
    const value = this.getCellValue(row, col.field);
    return col.badgeConfig?.label?.(value, row) ?? String(value ?? '');
  }

  isRowClickable(): boolean {
    return this.rowClicked.observed;
  }
}
