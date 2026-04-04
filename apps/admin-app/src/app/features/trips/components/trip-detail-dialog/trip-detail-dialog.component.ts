import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { Trip } from '@models/lib/trip.model';
import { Dog } from '@models/lib/dog.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';
import { EmptyStateComponent } from '@ui/lib/components/empty-state/empty-state.component';
import { ExportService } from '../../../../services/export.service';

type RequestDog = TripRequest['dogs'][number];

@Component({
  selector: 'app-trip-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DialogModule, ButtonModule, TagModule, TabsModule, AccordionModule, GenericTableComponent, EmptyStateComponent, TranslocoModule],
  templateUrl: './trip-detail-dialog.component.html',
  styleUrls: ['./trip-detail-dialog.component.scss'],
})
export class TripDetailDialogComponent {
  private readonly exportService = inject(ExportService);
  private readonly transloco = inject(TranslocoService);
  private readonly _t = toSignal(this.transloco.selectTranslation(), { initialValue: null });

  @Input() visible = false;
  @Input() header = '';
  @Input() trip: Trip | null = null;
  @Input() requests: TripRequest[] = [];
  @Input() activeTab = 'dogs';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() tabChanged = new EventEmitter<string>();
  @Output() editDog = new EventEmitter<{ dog: Dog; tripId: string }>();
  @Output() deleteDog = new EventEmitter<{ dog: Dog; tripId: string }>();
  @Output() approveRequest = new EventEmitter<TripRequest>();
  @Output() rejectRequest = new EventEmitter<TripRequest>();
  @Output() deleteRequest = new EventEmitter<TripRequest>();
  @Output() closed = new EventEmitter<void>();

  readonly requestDogConfig: TableConfig = { paginator: false, striped: true, trackByField: 'id' };

  readonly tableConfig = computed((): TableConfig => {
    this._t();
    return {
      paginator: false,
      emptyMessage: this.transloco.translate('trips.detail.noDogsYet'),
      trackByField: 'id',
    };
  });

  readonly dogColumns = computed((): TableColumn<Dog>[] => {
    this._t();
    return [
      { field: 'name', header: this.transloco.translate('trips.table.name') },
      { field: 'size', header: this.transloco.translate('trips.table.size') },
      { field: 'age', header: this.transloco.translate('trips.table.age'), formatter: (val) => `${val} yr` },
      { field: 'chipId', header: this.transloco.translate('trips.table.chipId') },
      { field: 'requesterName', header: this.transloco.translate('trips.table.requester') },
      { field: 'pickupLocation', header: this.transloco.translate('trips.table.pickup') },
      { field: 'dropLocation', header: this.transloco.translate('trips.table.drop') },
      { field: 'notes', header: this.transloco.translate('trips.table.notes') },
    ];
  });

  readonly dogActions = computed((): TableAction<Dog>[] => {
    this._t();
    return [
      {
        icon: 'pi pi-pencil',
        tooltip: this.transloco.translate('trips.detail.editDogTooltip'),
        action: (dog) => this.editDog.emit({ dog, tripId: this.trip!.id }),
      },
      {
        icon: 'pi pi-trash',
        tooltip: this.transloco.translate('trips.detail.deleteDogTooltip'),
        severity: 'danger',
        action: (dog) => this.deleteDog.emit({ dog, tripId: this.trip!.id }),
      },
    ];
  });

  readonly requestDogColumns = computed((): TableColumn<RequestDog>[] => {
    this._t();
    return [
      { field: 'name', header: this.transloco.translate('trips.table.name') },
      { field: 'size', header: this.transloco.translate('trips.table.size') },
      { field: 'age', header: this.transloco.translate('trips.table.age'), formatter: (val) => `${val} yr` },
      { field: 'chipId', header: this.transloco.translate('trips.table.chipId') },
      { field: 'pickupLocation', header: this.transloco.translate('trips.table.pickup') },
      { field: 'dropLocation', header: this.transloco.translate('trips.table.drop') },
    ];
  });

  onExportPdf(): void {
    if (this.trip) {
      this.exportService.exportTripManifestPdf(this.trip);
    }
  }

  onHide(): void {
    this.visibleChange.emit(false);
    this.closed.emit();
  }

  requestStatusSeverity(status: TripRequest['status']): 'warn' | 'success' | 'danger' | 'secondary' {
    if (status === 'pending') return 'warn';
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'secondary';
  }
}
