import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, TemplateRef, inject, computed, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { Trip } from '@models/lib/trip.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

@Component({
  selector: 'app-all-trips-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TagModule, GenericTableComponent, TranslocoModule],
  templateUrl: './all-trips-tab.component.html',
  styleUrls: ['./all-trips-tab.component.scss'],
})
export class AllTripsTabComponent {
  @Input() trips: Trip[] = [];
  @Output() editTrip = new EventEmitter<Trip>();
  @Output() deleteTrip = new EventEmitter<Trip>();
  @Output() viewDetails = new EventEmitter<Trip>();

  readonly routeTpl = viewChild.required<TemplateRef<unknown>>('routeTpl');
  readonly filledTpl = viewChild.required<TemplateRef<unknown>>('filledTpl');
  readonly remainingTpl = viewChild.required<TemplateRef<unknown>>('remainingTpl');
  readonly acceptingTpl = viewChild.required<TemplateRef<unknown>>('acceptingTpl');
  readonly statusTpl = viewChild.required<TemplateRef<unknown>>('statusTpl');

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
      { field: 'date', header: this.transloco.translate('trips.table.date'), sortable: true },
      { field: 'route', header: this.transloco.translate('trips.table.route'), type: 'template', template: this.routeTpl() },
      { field: 'totalCapacity', header: this.transloco.translate('trips.table.capacity'), sortable: true },
      { field: 'dogs', header: this.transloco.translate('trips.table.filled'), type: 'template', template: this.filledTpl() },
      { field: 'spotsAvailable', header: this.transloco.translate('trips.table.remaining'), type: 'template', template: this.remainingTpl() },
      { field: 'acceptingRequests', header: this.transloco.translate('trips.table.accepting'), type: 'template', template: this.acceptingTpl() },
      { field: 'status', header: this.transloco.translate('trips.table.status'), type: 'template', template: this.statusTpl() },
    ];
  });

  readonly actions = computed((): TableAction<Trip>[] => {
    this._t();
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
