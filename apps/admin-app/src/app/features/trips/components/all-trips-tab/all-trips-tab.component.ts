import { Component, ChangeDetectionStrategy, TemplateRef, inject, computed, viewChild, input, output } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { Trip } from '@models/lib/trip.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';
import { TripStatusBadgesComponent } from '@admin/shared/components/trip-status-badges/trip-status-badges.component';

@Component({
  selector: 'app-all-trips-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GenericTableComponent, TranslocoModule, TripStatusBadgesComponent],
  templateUrl: './all-trips-tab.component.html',
  styleUrls: ['./all-trips-tab.component.scss'],
})
export class AllTripsTabComponent {
  readonly trips = input<Trip[]>([]);
  readonly editTrip = output<Trip>();
  readonly deleteTrip = output<Trip>();
  readonly viewDetails = output<Trip>();

  readonly routeTpl = viewChild.required<TemplateRef<unknown>>('routeTpl');
  readonly filledTpl = viewChild.required<TemplateRef<unknown>>('filledTpl');
  readonly remainingTpl = viewChild.required<TemplateRef<unknown>>('remainingTpl');
  readonly statusBadgesTpl = viewChild.required<TemplateRef<unknown>>('statusBadgesTpl');

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
      { field: 'date', header: this.transloco.translate('trips.table.date'), sortable: true },
      { field: 'route', header: this.transloco.translate('trips.table.route'), type: 'template', template: this.routeTpl() },
      { field: 'totalCapacity', header: this.transloco.translate('trips.table.capacity'), sortable: true },
      { field: 'dogs', header: this.transloco.translate('trips.table.filled'), type: 'template', template: this.filledTpl() },
      { field: 'spotsAvailable', header: this.transloco.translate('trips.table.remaining'), type: 'template', template: this.remainingTpl() },
      { field: 'status', header: this.transloco.translate('trips.table.status'), type: 'template', template: this.statusBadgesTpl() },
    ];
  });

  readonly actions = computed((): TableAction<Trip>[] => {
    this.langChange();
    return [
      {
        icon: 'pi pi-pencil',
        tooltip: this.transloco.translate('trips.table.editTooltip'),
        severity: 'secondary',
        action: (trip) => this.editTrip.emit(trip),
      },
      {
        icon: 'pi pi-trash',
        tooltip: this.transloco.translate('trips.table.deleteTooltip'),
        severity: 'danger',
        action: (trip) => this.deleteTrip.emit(trip),
      },
    ];
  });
}
