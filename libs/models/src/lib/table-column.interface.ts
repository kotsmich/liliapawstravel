import { TemplateRef } from '@angular/core';

export interface TableColumn<T = unknown> {
  field: string;
  header: string;
  sortable?: boolean;
  width?: string;
  type?: 'text' | 'date' | 'badge' | 'avatar' | 'actions' | 'template' | 'icon-button';
  dateFormat?: string;
  badgeConfig?: {
    severity: (value: unknown, row: T) => 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'warn';
    label?: (value: unknown, row: T) => string;
  };
  iconButtonConfig?: {
    icon: string;
    tooltip?: string;
    severity?: 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast';
    disabled?: (row: T) => boolean;
    action: (row: T) => void;
  };
  template?: TemplateRef<unknown>;
  formatter?: (value: unknown, row: T) => string;
}

export interface TableAction<T = unknown> {
  icon: string;
  label?: string;
  tooltip: string;
  severity?: 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast';
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
  action: (row: T) => void;
}

export interface TableConfig {
  rowsPerPage?: number;
  paginator?: boolean;
  sortField?: string;
  sortOrder?: 1 | -1;
  selectable?: boolean;
  striped?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  trackByField?: string;
}
