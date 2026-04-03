import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
export class TripDetailDialogComponent implements OnInit {
  private exportService = inject(ExportService);
  private transloco = inject(TranslocoService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

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

  dogColumns: TableColumn<Dog>[] = [];
  dogActions: TableAction<Dog>[] = [];
  requestDogColumns: TableColumn<RequestDog>[] = [];
  tableConfig: TableConfig = { paginator: false, trackByField: 'id' };
  requestDogConfig: TableConfig = { paginator: false, striped: true, trackByField: 'id' };

  ngOnInit(): void {
    this.transloco.selectTranslation().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.tableConfig = {
        paginator: false,
        emptyMessage: this.transloco.translate('trips.detail.noDogsYet'),
        trackByField: 'id',
      };
      this.dogColumns = [
        { field: 'name', header: this.transloco.translate('trips.table.name') },
        { field: 'size', header: this.transloco.translate('trips.table.size') },
        { field: 'age', header: this.transloco.translate('trips.table.age'), formatter: (val) => `${val} yr` },
        { field: 'chipId', header: this.transloco.translate('trips.table.chipId') },
        { field: 'requesterName', header: this.transloco.translate('trips.table.requester') },
        { field: 'pickupLocation', header: this.transloco.translate('trips.table.pickup') },
        { field: 'dropLocation', header: this.transloco.translate('trips.table.drop') },
        { field: 'notes', header: this.transloco.translate('trips.table.notes') },
      ];
      this.dogActions = [
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
      this.requestDogColumns = [
        { field: 'name', header: this.transloco.translate('trips.table.name') },
        { field: 'size', header: this.transloco.translate('trips.table.size') },
        { field: 'age', header: this.transloco.translate('trips.table.age'), formatter: (val) => `${val} yr` },
        { field: 'chipId', header: this.transloco.translate('trips.table.chipId') },
        { field: 'pickupLocation', header: this.transloco.translate('trips.table.pickup') },
        { field: 'dropLocation', header: this.transloco.translate('trips.table.drop') },
      ];
      this.cdr.markForCheck();
    });
  }

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
