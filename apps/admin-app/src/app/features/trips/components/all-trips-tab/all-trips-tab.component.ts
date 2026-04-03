import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
export class AllTripsTabComponent implements OnInit {
  @Input() trips: Trip[] = [];
  @Output() editTrip = new EventEmitter<Trip>();
  @Output() deleteTrip = new EventEmitter<Trip>();
  @Output() viewDetails = new EventEmitter<Trip>();

  @ViewChild('routeTpl', { static: true }) routeTpl!: TemplateRef<unknown>;
  @ViewChild('filledTpl', { static: true }) filledTpl!: TemplateRef<unknown>;
  @ViewChild('remainingTpl', { static: true }) remainingTpl!: TemplateRef<unknown>;
  @ViewChild('acceptingTpl', { static: true }) acceptingTpl!: TemplateRef<unknown>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<unknown>;

  private transloco = inject(TranslocoService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  tableConfig: TableConfig = { paginator: false, trackByField: 'id' };

  columns: TableColumn<Trip>[] = [];

  actions: TableAction<Trip>[] = [];

  ngOnInit(): void {
    this.transloco.selectTranslation().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.tableConfig = {
        trackByField: 'id',
        emptyMessage: this.transloco.translate('trips.table.empty'),
        paginator: false,
      };
      this.columns = [
        { field: 'date', header: this.transloco.translate('trips.table.date'), sortable: true },
        { field: 'route', header: this.transloco.translate('trips.table.route'), type: 'template', template: this.routeTpl },
        { field: 'totalCapacity', header: this.transloco.translate('trips.table.capacity'), sortable: true },
        { field: 'dogs', header: this.transloco.translate('trips.table.filled'), type: 'template', template: this.filledTpl },
        { field: 'spotsAvailable', header: this.transloco.translate('trips.table.remaining'), type: 'template', template: this.remainingTpl },
        { field: 'acceptingRequests', header: this.transloco.translate('trips.table.accepting'), type: 'template', template: this.acceptingTpl },
        { field: 'status', header: this.transloco.translate('trips.table.status'), type: 'template', template: this.statusTpl },
      ];
      this.actions = [
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
      this.cdr.markForCheck();
    });
  }
}
