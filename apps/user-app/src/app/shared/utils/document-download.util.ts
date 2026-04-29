import { environment } from '../../../environments/environment';

export type ExportLang = 'en' | 'el' | 'de';
export type ExportFormat = 'pdf' | 'docx';

export function downloadDocument(lang: ExportLang, format: ExportFormat): void {
  const fileName = `dog-document-${lang}.${format}`;
  const version = environment.assetVersion;
  const url = version ? `/assets/exports/${fileName}?v=${version}` : `/assets/exports/${fileName}`;
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
