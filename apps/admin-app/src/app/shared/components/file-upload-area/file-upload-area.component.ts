import {
  Component, ChangeDetectionStrategy, ViewChild, ElementRef,
  Input, input, output, signal, ChangeDetectorRef, inject,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslocoModule } from '@jsverse/transloco';

export type FileUploadPreviewType = 'image' | 'document';

@Component({
  selector: 'app-file-upload-area',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, TooltipModule, TranslocoModule],
  templateUrl: './file-upload-area.component.html',
  styleUrl: './file-upload-area.component.scss',
})
export class FileUploadAreaComponent {
  /** Label shown above the drop zone. */
  readonly label = input.required<string>();
  /** Optional suffix shown in muted text next to the label. */
  readonly optionalLabel = input<string>('');
  /** Hint text inside the empty drop zone. */
  readonly clickHint = input.required<string>();
  /** Formats hint text inside the empty drop zone. */
  readonly formatsHint = input.required<string>();
  /** Icon class for the empty drop zone (e.g. 'pi pi-camera'). */
  readonly icon = input.required<string>();
  /** accept attribute forwarded to the hidden file input. */
  readonly accept = input.required<string>();
  /** 'image' renders a thumbnail; 'document' renders a filename. */
  readonly previewType = input<FileUploadPreviewType>('document');
  /** Tooltip for the remove button. */
  readonly removeTooltip = input.required<string>();
  @Input() set existingUrl(value: string | null) {
    this.seedFromExisting(value);
  }

  readonly fileChange = output<File | null>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly previewUrl = signal<string | null>(null);
  readonly fileName = signal<string | null>(null);

  private readonly cdr = inject(ChangeDetectorRef);

  private seedFromExisting(url: string | null): void {
    if (url) {
      if (this.previewType() === 'image') {
        this.previewUrl.set(url);
        this.fileName.set(null);
      } else {
        this.fileName.set(url.split('/').pop() ?? 'document');
        this.previewUrl.set(null);
      }
    } else {
      this.previewUrl.set(null);
      this.fileName.set(null);
    }
  }


  hasPreview(): boolean {
    return this.previewType() === 'image' ? !!this.previewUrl() : !!this.fileName();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.applyFile(file);
    this.fileInput.nativeElement.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.applyFile(file);
  }

  private applyFile(file: File): void {
    if (this.previewType() === 'image') {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.previewUrl.set((event.target as FileReader).result as string);
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    } else {
      this.fileName.set(file.name);
    }
    this.fileChange.emit(file);
    this.cdr.markForCheck();
  }

  removeFile(): void {
    this.previewUrl.set(null);
    this.fileName.set(null);
    this.fileChange.emit(null);
    this.cdr.markForCheck();
  }
}
