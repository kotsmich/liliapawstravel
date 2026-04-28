import { ChangeDetectionStrategy, Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ExportFormat, ExportLang, downloadDocument } from '../../utils/document-download.util';

const SUPPORTED_LANGS: ReadonlyArray<ExportLang> = ['en', 'el', 'de'];

function isExportLang(value: string): value is ExportLang {
  return (SUPPORTED_LANGS as ReadonlyArray<string>).includes(value);
}

interface LangOption {
  value: ExportLang;
  flag: string;
  ariaLabel: string;
}

interface FormatOption {
  value: ExportFormat;
  labelKey: string;
}

@Component({
  selector: 'app-document-export-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DialogModule, ButtonModule, SelectModule, TranslocoModule],
  templateUrl: './document-export-dialog.component.html',
  styleUrls: ['./document-export-dialog.component.scss'],
})
export class DocumentExportDialogComponent {
  readonly visible = signal(false);

  readonly selectedLang = signal<ExportLang>('en');
  readonly selectedFormat = signal<ExportFormat>('pdf');

  private readonly platformId = inject(PLATFORM_ID);
  private readonly transloco = inject(TranslocoService);

  readonly langs: LangOption[] = [
    { value: 'en', flag: 'gb', ariaLabel: 'English' },
    { value: 'el', flag: 'gr', ariaLabel: 'Ελληνικά' },
    { value: 'de', flag: 'de', ariaLabel: 'Deutsch' },
  ];

  readonly formatOptions: FormatOption[] = [
    { value: 'pdf', labelKey: 'tripRequest.exportDialog.formatPdf' },
    { value: 'docx', labelKey: 'tripRequest.exportDialog.formatWord' },
  ];

  open(): void {
    const active = this.transloco.getActiveLang();
    if (isExportLang(active)) {
      this.selectedLang.set(active);
    }
    this.visible.set(true);
  }

  selectLang(lang: ExportLang): void {
    this.selectedLang.set(lang);
  }

  onExport(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    downloadDocument(this.selectedLang(), this.selectedFormat());
    this.visible.set(false);
  }

  onCancel(): void {
    this.visible.set(false);
  }
}
