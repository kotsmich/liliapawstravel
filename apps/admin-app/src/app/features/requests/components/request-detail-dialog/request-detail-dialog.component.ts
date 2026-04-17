import { Component, ChangeDetectionStrategy, inject, computed, input, output, signal } from '@angular/core';
import { LocalDatePipe } from '@ui/lib/pipes/local-date.pipe';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { TripRequest } from '@models/lib/trip-request.model';
import { Trip } from '@models/lib/trip.model';
import { TableColumn, TableConfig } from '@models/lib/table-column.interface';
import { requestStatusSeverity, requestStatusLabel, RequestStatus } from '@admin/shared/utils/status';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';
import { MediaViewerComponent } from '../../../../shared/components/media-viewer/media-viewer.component';
import { InternalNoteEditorComponent } from './internal-note-editor/internal-note-editor.component';
import { RequestInfoGridComponent } from './request-info-grid/request-info-grid.component';
import { RequestDetailFooterComponent } from './request-detail-footer/request-detail-footer.component';

type RequestDog = TripRequest['dogs'][number];

@Component({
  selector: 'app-request-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, TagModule, GenericTableComponent, TranslocoModule, MediaViewerComponent, InternalNoteEditorComponent, RequestInfoGridComponent, RequestDetailFooterComponent],
  providers: [LocalDatePipe],
  templateUrl: './request-detail-dialog.component.html',
  styleUrl: './request-detail-dialog.component.scss',
})
export class RequestDetailDialogComponent {
  readonly visible = input(false);
  readonly request = input<TripRequest | null>(null);
  readonly trips = input<Trip[]>([]);

  readonly visibleChange = output<boolean>();
  readonly approve = output<void>();
  readonly reject = output<void>();
  readonly cancel = output<void>();
  readonly saveNote = output<string>();

  readonly requestStatusSeverity = requestStatusSeverity;
  readonly requestStatusLabel = (status: RequestStatus) => requestStatusLabel(status, this.transloco);

  readonly previewUrl = signal<string | null>(null);
  readonly previewHeader = signal('');
  readonly previewVisible = signal(false);

  readonly isDocPreview = computed(() =>
    (this.previewUrl() ?? '').toLowerCase().includes('.pdf'),
  );

  private readonly transloco = inject(TranslocoService);
  private readonly localDate = inject(LocalDatePipe);
  // private readonly langChange = toSignal(this.transloco.selectTranslation(), { initialValue: null });

  readonly dogConfig = computed((): TableConfig => {
    return {
      paginator: false,
      emptyMessage: this.transloco.translate('requests.detail.noDogs'),
      trackByField: 'id',
    };
  });

  readonly dogColumns = computed((): TableColumn<RequestDog>[] => {
    return [
      {
        field: 'photoUrl',
        header: this.transloco.translate('requests.detail.colPhoto'),
        width: '3rem',
        type: 'icon-button',
        iconButtonConfig: {
          icon: 'pi pi-image',
          tooltip: this.transloco.translate('requests.detail.viewPhoto'),
          disabled: (dog) => !dog.photoUrl,
          action: (dog) => {
            this.previewUrl.set(dog.photoUrl ?? null);
            this.previewHeader.set(this.transloco.translate('requests.detail.photoPreviewHeader'));
            this.previewVisible.set(true);
          },
        },
      },
      {
        field: 'documentUrl',
        header: this.transloco.translate('requests.detail.colDocument'),
        width: '3rem',
        type: 'icon-button',
        iconButtonConfig: {
          icon: 'pi pi-file',
          tooltip: this.transloco.translate('requests.detail.viewDocument'),
          disabled: (dog) => !dog.documentUrl,
          action: (dog) => {
            this.previewUrl.set(dog.documentUrl ?? null);
            this.previewHeader.set(this.transloco.translate('requests.detail.documentPreviewHeader'));
            this.previewVisible.set(true);
          },
        },
      },
      { field: 'name', header: this.transloco.translate('trips.table.name') },
      { field: 'size', header: this.transloco.translate('trips.table.size') },
      { field: 'gender', header: this.transloco.translate('trips.table.gender') },
      { field: 'age', header: this.transloco.translate('trips.table.age'), formatter: (val) => `${val} yr` },
      { field: 'chipId', header: this.transloco.translate('trips.table.chipId') },
      { field: 'pickupLocation', header: this.transloco.translate('trips.table.pickup') },
      { field: 'dropLocation', header: this.transloco.translate('trips.table.drop') },
    ];
  });

  tripDate(tripId: string | undefined): string {
    if (!tripId) return '—';
    const trip = this.trips().find((trip) => trip.id === tripId);
    return trip ? this.localDate.transform(trip.date) : tripId;
  }
}
