import { Component, ChangeDetectionStrategy, inject, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
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
  imports: [DatePipe, DialogModule, ButtonModule, TagModule, TabsModule, AccordionModule, GenericTableComponent, EmptyStateComponent, TranslocoModule],
  templateUrl: './trip-detail-dialog.component.html',
  styleUrls: ['./trip-detail-dialog.component.scss'],
})
export class TripDetailDialogComponent {
  private readonly exportService = inject(ExportService);
  private readonly transloco = inject(TranslocoService);
  private readonly _t = toSignal(this.transloco.selectTranslation(), { initialValue: null });

  readonly visible = input(false);
  readonly header = input('');
  readonly trip = input<Trip | null>(null);
  readonly requests = input<TripRequest[]>([]);
  readonly activeTab = input('dogs');
  readonly visibleChange = output<boolean>();
  readonly tabChanged = output<string>();
  readonly editDog = output<{ dog: Dog; tripId: string }>();
  readonly deleteDog = output<{ dog: Dog; tripId: string }>();
  readonly approveRequest = output<TripRequest>();
  readonly rejectRequest = output<TripRequest>();
  readonly deleteRequest = output<TripRequest>();
  readonly closed = output<void>();

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
      { field: 'gender', header: this.transloco.translate('trips.table.gender') },
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
        action: (dog) => this.editDog.emit({ dog, tripId: this.trip()!.id }),
      },
      {
        icon: 'pi pi-trash',
        tooltip: this.transloco.translate('trips.detail.deleteDogTooltip'),
        severity: 'danger',
        action: (dog) => this.deleteDog.emit({ dog, tripId: this.trip()!.id }),
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
    const trip = this.trip();
    if (trip) {
      this.exportService.exportTripManifestPdf(trip);
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
