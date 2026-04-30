import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { MediaViewerComponent } from '@admin/shared/components/media-viewer/media-viewer.component';
import { DetailDialogBase } from '@admin/shared/components/detail-dialog-base';

@Component({
  selector: 'app-request-preview-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, MediaViewerComponent],
  templateUrl: './request-preview-dialog.component.html',
  styleUrl: './request-preview-dialog.component.scss',
})
export class RequestPreviewDialogComponent extends DetailDialogBase {
  readonly url = input<string | null>(null);
  readonly header = input<string>('');

  readonly isDocPreview = computed(() => {
    const url = (this.url() ?? '').toLowerCase();
    if (!url) return false;
    const path = url.split('#')[0].split('?')[0];
    return !/\.(jpg|jpeg|png|webp|gif)$/.test(path);
  });
}
