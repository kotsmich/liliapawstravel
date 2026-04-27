import { TableColumn } from '@models/lib/table-column.interface';

type BadgeSeverity = 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'warn';

export function statusBadgeColumn<T>(
  field: keyof T & string,
  header: string,
  severity: (value: unknown, row: T) => BadgeSeverity,
  label: (value: unknown, row: T) => string,
  options: { sortable?: boolean } = {},
): TableColumn<T> {
  return {
    field,
    header,
    sortable: options.sortable ?? false,
    type: 'badge',
    badgeConfig: { severity, label },
  };
}
