import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';
import { DogManagerService } from '@admin/features/trips/trip-form/dog-manager.service';
import { TripManifestExportService } from '@admin/services/trip-manifest-export.service';

@Component({
  selector: 'app-trip-dogs-export-pdf',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, TranslocoModule],
  template: `
    <p-button
      [label]="'trips.detail.exportPdf' | transloco"
      icon="pi pi-file-pdf"
      severity="secondary"
      [outlined]="true"
      [disabled]="disabled()"
      (click)="onExport()" />
  `,
})
export class TripDogsExportPdfComponent {
  private readonly exportService = inject(TripManifestExportService);
  private readonly dogManager = inject(DogManagerService);

  readonly activeTab = input('all');

  readonly disabled = computed(() => !this.dogManager.dogsData().length);

  async onExport(): Promise<void> {
    const trip = this.dogManager.currentTrip();
    if (!trip) return;

    try {
      switch (this.activeTab()) {
        case 'byRequestor':
          await this.exportService.exportGroupedManifestPdf(trip, this.dogManager.requestorGroups(), 'Requestor');
          break;
        case 'byDestination':
          await this.exportService.exportGroupedManifestPdf(trip, this.dogManager.destinationGroups(), 'Destination');
          break;
        case 'byPickup':
          await this.exportService.exportGroupedManifestPdf(trip, this.dogManager.pickupGroups(), 'Pickup');
          break;
        default:
          await this.exportService.exportTripManifestPdf(trip);
      }
    } catch (err) {
      console.error('[ExportPdf] Failed to generate PDF:', err);
    }
  }
}
