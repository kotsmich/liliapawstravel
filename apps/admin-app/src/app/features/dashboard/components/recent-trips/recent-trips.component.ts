import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { Trip } from '@models/lib/trip.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

@Component({
  selector: 'app-recent-trips',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CardModule, ButtonModule, GenericTableComponent, TranslocoModule],
  templateUrl: './recent-trips.component.html',
  styles: [`:host ::ng-deep .table-scroll { overflow-x: auto; }`],
})
export class RecentTripsComponent {
  @Input() trips: Trip[] = [];
  @Output() viewTrip = new EventEmitter<Trip>();
  @Output() navigateToAllTrips = new EventEmitter<void>();

  private readonly transloco = inject(TranslocoService);
  private readonly _t = toSignal(this.transloco.selectTranslation(), { initialValue: null });

  readonly tableConfig = computed((): TableConfig => {
    this._t();
    return {
      trackByField: 'id',
      emptyMessage: this.transloco.translate('trips.table.empty'),
      paginator: false,
    };
  });

  readonly columns = computed((): TableColumn<Trip>[] => {
    this._t();
    return [
      {
        field: 'route',
        header: this.transloco.translate('trips.table.route'),
        formatter: (_, row) => {
          const t = row as Trip;
          return `${t.departureCity}, ${t.departureCountry} → ${t.arrivalCity}, ${t.arrivalCountry}`;
        },
      },
      { field: 'date', header: this.transloco.translate('trips.table.date') },
      {
        field: 'dogs',
        header: this.transloco.translate('trips.dogs'),
        formatter: (_, row) => String((row as Trip).dogs?.length ?? 0),
      },
      {
        field: 'status',
        header: this.transloco.translate('trips.table.status'),
        type: 'badge',
        badgeConfig: {
          severity: (_, row) => {
            const trip = row as Trip;
            return trip.status === 'upcoming' ? 'info' : trip.status === 'completed' ? 'success' : 'secondary';
          },
          label: (_, row) => {
            const status = (row as Trip).status;
            if (status === 'upcoming') return this.transloco.translate('trips.tags.upcoming');
            if (status === 'completed') return this.transloco.translate('trips.tags.completed');
            return this.transloco.translate('trips.tags.inProgress');
          },
        },
      },
    ];
  });

  readonly actions = computed((): TableAction<Trip>[] => {
    this._t();
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
