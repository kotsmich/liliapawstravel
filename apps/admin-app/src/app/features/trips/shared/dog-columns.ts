import { Dog } from '@models/lib/dog.model';
import { TableColumn } from '@models/lib/table-column.interface';

/**
 * Shared dog column definitions used in both the trip-form and the trip-detail dialog.
 * Generic over T so callers can narrow to Dog & { _idx: number } or any other Dog subtype.
 */
export function buildDogColumns<T extends Dog>(): TableColumn<T>[] {
  return [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'gender', header: 'Gender', formatter: (value) => String(value ?? '—') },
    {
      field: 'size', header: 'Size', type: 'badge',
      badgeConfig: {
        severity: (value) => value === 'small' ? 'success' : value === 'medium' ? 'warn' : 'danger',
        label: (value) => String(value ?? ''),
      },
    },
    { field: 'age', header: 'Age', formatter: (value) => value != null ? `${value} yr` : '—' },
    { field: 'pickupLocation', header: 'Pickup' },
    { field: 'dropLocation', header: 'Drop' },
    { field: 'chipId', header: 'Chip ID' },
    { field: 'requesterName', header: 'Requester', formatter: (value) => String(value ?? '—') },
  ] as TableColumn<T>[];
}
