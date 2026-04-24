import { Dog } from '@models/lib/dog.model';
import { TripDestination, TripRequester } from '@models/lib/trip.model';
import { TableColumn } from '@models/lib/table-column.interface';

/**
 * Shared dog column definitions used in both the trip-form and the trip-detail dialog.
 * Generic over T so callers can narrow to Dog & { _idx: number } or any other Dog subtype.
 * Pass destinations so the Delivery Stop column can resolve the destination name from its ID.
 * Pass requesters so the Requester column can resolve the requester name from its ID.
 * Pass t() to translate column headers; falls back to the key itself if omitted.
 */
export function buildDogColumns<T extends Dog>(
  destinations: TripDestination[] = [],
  t: (key: string) => string = (key) => key,
  requesters: TripRequester[] = [],
): TableColumn<T>[] {
  return [
    { field: 'name', header: t('trips.table.name'), sortable: true },
    {
      field: 'requesterId', header: t('trips.table.requester'), sortable: true,
      formatter: (value) => requesters.find(r => r.requesterId === value)?.name ?? '—',
    },
    // { field: 'age', header: t('trips.table.age'), sortable: true, formatter: (value) => value != null ? `${value} yr` : '—' },
    {
      field: 'pickupLocation', header: t('trips.table.pickup'), sortable: true, type: 'badge',
      badgeConfig: {
        severity: (value) => value ? 'success' : 'secondary',
        label: (value) => String(value ?? '—'),
        icon: (value) => value ? 'pi pi-map-marker' : '',
      },
    },
    {
      field: 'destinationId', header: t('trips.table.deliveryStop'), type: 'badge',
      sortable: true, sortField: '_destinationName',
      badgeConfig: {
        severity: (value) => (value && destinations.some(d => d.id === value)) ? 'success' : 'warn',
        label: (value) => {
          if (!value) return t('trips.table.notAssigned');
          return destinations.find(d => d.id === value)?.name ?? t('trips.table.notAssigned');
        },
        icon: (value) => (value && destinations.some(d => d.id === value)) ? 'pi pi-map-marker' : 'pi pi-exclamation-triangle',
        tooltip: (value) => (value && destinations.some(d => d.id === value)) ? '' : t('dogs.warnings.noDestination'),
      },
    },
    { field: 'receiver', header: t('trips.table.receiver'), sortable: true, formatter: (value) => String(value ?? '—') },
  ] as TableColumn<T>[];
}
