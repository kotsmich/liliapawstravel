import { Component, ChangeDetectionStrategy, input, output, computed, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';
import { Dog } from '@models/lib/dog.model';
import { DogBioExportService } from '../../../../services/dog-bio-export.service';
import { DogDetailsGridComponent } from './dog-details-grid/dog-details-grid.component';
import { MediaViewerComponent } from '../../../../shared/components/media-viewer/media-viewer.component';

@Component({
  selector: 'app-dog-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, TranslocoModule, DogDetailsGridComponent, MediaViewerComponent],
  templateUrl: './dog-detail-dialog.component.html',
  styleUrl: './dog-detail-dialog.component.scss',
})
export class DogDetailDialogComponent {
  private readonly exportService = inject(DogBioExportService);

  readonly visible = input(false);
  readonly dog = input<Dog | null>(null);
  readonly visibleChange = output<boolean>();

  readonly header = computed(() => this.dog()?.name ?? '');

  onDownloadBio(): void {
    const dog = this.dog();
    if (dog) this.exportService.exportDogBioPdf(dog);  // returns Promise, fire-and-forget is fine
  }
}
