import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { FileUploadAreaComponent } from '@admin/shared/components/file-upload-area/file-upload-area.component';

/**
 * Side-by-side photo + document upload areas extracted from dog-fields.component.html (lines 117–143).
 */
@Component({
  selector: 'app-dog-documents-uploader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FileUploadAreaComponent, TranslocoModule],
  templateUrl: './dog-documents-uploader.component.html',
  styleUrl: './dog-documents-uploader.component.scss',
})
export class DogDocumentsUploaderComponent {
  readonly existingPhotoUrl = input<string | null>(null);
  readonly existingDocumentUrl = input<string | null>(null);

  readonly photoFileChange = output<File | null>();
  readonly documentFileChange = output<File | null>();
}
