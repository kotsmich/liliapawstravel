import { Dog } from '@models/lib/dog.model';
import { TableColumn } from '@models/lib/table-column.interface';

/**
 * Shared dog column definitions used in both the trip-form and the trip-detail dialog.
 * Generic over T so callers can narrow to Dog & { _idx: number } or any other Dog subtype.
 */
export function buildDogColumns<T extends Dog>(): TableColumn<T>[] {
  return [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'gender', header: 'Gender', formatter: (v) => String(v ?? '—') },
    {
      field: 'size', header: 'Size', type: 'badge',
      badgeConfig: {
        severity: (v) => v === 'small' ? 'success' : v === 'medium' ? 'warn' : 'danger',
        label: (v) => String(v ?? ''),
      },
    },
    { field: 'age', header: 'Age', formatter: (v) => v != null ? `${v} yr` : '—' },
    { field: 'pickupLocation', header: 'Pickup' },
    { field: 'dropLocation', header: 'Drop' },
    { field: 'chipId', header: 'Chip ID' },
    { field: 'requesterName', header: 'Requester', formatter: (v) => String(v ?? '—') },
  ] as TableColumn<T>[];
}
