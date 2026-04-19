import { Component, ChangeDetectionStrategy, input, output, computed, model } from '@angular/core';
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
  readonly data = input<T[]>([]);
  readonly columns = input<TableColumn<T>[]>([]);
  readonly actions = input<TableAction<T>[]>([]);
  readonly config = input<TableConfig>({});
  readonly loading = input(false);
  readonly selection = model<T[]>([]);
  readonly rowSelectable = input<(row: T) => boolean>();
  readonly rowClickable = input(false);

  readonly rowClicked = output<T>();

  readonly tableData = computed(() => {
    const d = this.data();
    return d ? [...d] : [];
  });

  trackByFn = (index: number, item: T): unknown => {
    const field = this.config().trackByField ?? 'id';
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

  getBadgeIcon(col: TableColumn<T>, row: T): string {
    const value = this.getCellValue(row, col.field);
    return col.badgeConfig?.icon?.(value, row) ?? '';
  }

  getBadgeTooltip(col: TableColumn<T>, row: T): string {
    const value = this.getCellValue(row, col.field);
    return col.badgeConfig?.tooltip?.(value, row) ?? '';
  }
}
