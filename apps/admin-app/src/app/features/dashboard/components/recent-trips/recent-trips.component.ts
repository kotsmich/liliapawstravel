import { Component, ChangeDetectionStrategy, inject, computed, input, output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { Trip } from '@models/lib/trip.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { tripStatusSeverity, tripStatusLabel, TripStatus } from '@admin/shared/utils/status';
import { statusBadgeColumn } from '@admin/shared/utils/status-badge-column';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

@Component({
  selector: 'app-recent-trips',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, ButtonModule, GenericTableComponent, TranslocoModule],
  templateUrl: './recent-trips.component.html',
  styleUrl: './recent-trips.component.scss',
})
export class RecentTripsComponent {
  readonly trips = input<Trip[]>([]);
  readonly viewTrip = output<Trip>();
  readonly navigateToAllTrips = output<void>();

  private readonly transloco = inject(TranslocoService);
  private readonly langChange = toSignal(this.transloco.selectTranslation(), { initialValue: null });

  readonly tableConfig = computed((): TableConfig => {
    this.langChange();
    return {
      trackByField: 'id',
      emptyMessage: this.transloco.translate('trips.table.empty'),
      paginator: false,
    };
  });

  readonly columns = computed((): TableColumn<Trip>[] => {
    this.langChange();
    return [
      {
        field: 'route',
        header: this.transloco.translate('trips.table.route'),
        formatter: (_, row) => `${row.departureCity}, ${row.departureCountry} → ${row.arrivalCity}, ${row.arrivalCountry}`,
      },
      { field: 'date', header: this.transloco.translate('trips.table.date') },
      {
        field: 'dogs',
        header: this.transloco.translate('trips.dogs'),
        formatter: (_, row) => String(row.dogs?.length ?? 0),
      },
      statusBadgeColumn<Trip>(
        'status',
        this.transloco.translate('trips.table.status'),
        (_, row) => tripStatusSeverity(row.status as TripStatus),
        (_, row) => tripStatusLabel(row.status as TripStatus, this.transloco),
      ),
    ];
  });

  readonly actions = computed((): TableAction<Trip>[] => {
    this.langChange();
    return [
      {
        icon: 'pi pi-pencil',
        tooltip: this.transloco.translate('trips.table.viewEditTooltip'),
        severity: 'secondary',
        action: (trip) => this.viewTrip.emit(trip),
      },
    ];
  });
}
