import { environment } from '../../../environments/environment';

export type ExportLang = 'en' | 'el' | 'de';
export type ExportFormat = 'pdf' | 'docx';

const DOWNLOAD_BASE_NAME: Record<ExportLang, string> = {
  en: 'Authorization',
  el: 'Εξουσιοδότηση',
  de: 'Vollmacht',
};

export function downloadDocument(lang: ExportLang, format: ExportFormat): void {
  const sourceFile = `dog-document-${lang}.${format}`;
  const downloadName = `${DOWNLOAD_BASE_NAME[lang]}.${format}`;
  const version = environment.assetVersion;
  const url = version ? `/assets/exports/${sourceFile}?v=${version}` : `/assets/exports/${sourceFile}`;
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = downloadName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
