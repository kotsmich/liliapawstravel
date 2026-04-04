import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { TripRequest } from '@models/lib/trip-request.model';
import { Trip } from '@models/lib/trip.model';
import { TableColumn, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

type RequestDog = TripRequest['dogs'][number];

@Component({
  selector: 'app-request-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DialogModule, ButtonModule, TagModule, TextareaModule, GenericTableComponent, TranslocoModule],
  templateUrl: './request-detail-dialog.component.html',
  styleUrl: './request-detail-dialog.component.scss',
})
export class RequestDetailDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() request: TripRequest | null = null;
  @Input() trips: Trip[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() approve = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() saveNote = new EventEmitter<string>();

  noteText = '';

  private readonly transloco = inject(TranslocoService);
  private readonly _t = toSignal(this.transloco.selectTranslation(), { initialValue: null });

  readonly dogConfig = computed((): TableConfig => {
    this._t();
    return {
      paginator: false,
      emptyMessage: this.transloco.translate('requests.detail.noDogs'),
      trackByField: 'id',
    };
  });

  readonly dogColumns = computed((): TableColumn<RequestDog>[] => {
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

  ngOnChanges(): void {
    if (this.request) {
      this.noteText = this.request.adminNote ?? '';
    }
  }

  statusSeverity(status: TripRequest['status']): 'warn' | 'success' | 'danger' | 'secondary' {
    if (status === 'pending') return 'warn';
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'secondary';
  }

  fmtDate(date: string): string {
    if (!date) return '—';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }

  tripDate(tripId: string | undefined): string {
    if (!tripId) return '—';
    const trip = this.trips.find((t) => t.id === tripId);
    return trip ? this.fmtDate(trip.date) : tripId;
  }
}
