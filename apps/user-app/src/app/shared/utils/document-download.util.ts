export type ExportLang = 'en' | 'el' | 'de';
export type ExportFormat = 'pdf' | 'docx';

export function downloadDocument(lang: ExportLang, format: ExportFormat): void {
  const fileName = `dog-document-${lang}.${format}`;
  const url = `/assets/exports/${fileName}`;
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
