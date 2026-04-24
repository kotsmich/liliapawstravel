/** Shared constants and helpers for PDF export services. */

export const BRAND_COLOR: [number, number, number] = [224, 123, 84];
export const BRAND_HEADER_HEIGHT = 12;
export const PAGE_MARGIN = 14;
export const UNICODE_FONT = 'NotoSans';

let regularFontCache: string | null = null;
let boldFontCache: string | null = null;

async function fetchFontAsBase64(path: string): Promise<string | null> {
  const response = await fetch(path);
  if (!response.ok) {
    console.warn(`[PDF] Font not found at ${path} (${response.status})`);
    return null;
  }
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Loads NotoSans (Regular + Bold) from /assets/fonts/ into the jsPDF document
 * so non-Latin characters (e.g. Greek) render correctly in both weights.
 * Returns the registered font name, or 'helvetica' if the regular font file
 * is not found. If bold is missing, falls back to regular for the bold style
 * to avoid autotable "Unable to look up font label" warnings.
 */
export async function loadUnicodeFontIntoDoc(doc: import('jspdf').jsPDF): Promise<string> {
  try {
    if (!regularFontCache) {
      regularFontCache = await fetchFontAsBase64('/assets/fonts/NotoSans-Regular.ttf');
    }
    if (!regularFontCache) {
      console.warn('[PDF] Regular font missing — falling back to helvetica');
      return 'helvetica';
    }

    if (boldFontCache === null) {
      boldFontCache = await fetchFontAsBase64('/assets/fonts/NotoSans-Bold.ttf');
    }

    doc.addFileToVFS('NotoSans-Regular.ttf', regularFontCache);
    doc.addFont('NotoSans-Regular.ttf', UNICODE_FONT, 'normal');

    if (boldFontCache) {
      doc.addFileToVFS('NotoSans-Bold.ttf', boldFontCache);
      doc.addFont('NotoSans-Bold.ttf', UNICODE_FONT, 'bold');
    } else {
      doc.addFont('NotoSans-Regular.ttf', UNICODE_FONT, 'bold');
    }

    doc.setFont(UNICODE_FONT, 'normal');
    return UNICODE_FONT;
  } catch (err) {
    console.warn('[PDF] Font loading failed — falling back to helvetica', err);
    return 'helvetica';
  }
}

export async function fetchImageAsBase64(
  url: string,
): Promise<{ dataUrl: string; format: string; width: number; height: number } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const format = blob.type.includes('png') ? 'PNG' : 'JPEG';
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject();
      reader.readAsDataURL(blob);
    });
    const { width, height } = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 800, height: 600 });
      img.src = dataUrl;
    });
    return { dataUrl, format, width, height };
  } catch {
    return null;
  }
}

export function fitDimensions(
  srcW: number, srcH: number, maxW: number, maxH: number,
): { w: number; h: number } {
  const ratio = Math.min(maxW / srcW, maxH / srcH);
  return { w: srcW * ratio, h: srcH * ratio };
}

export function drawBrandedHeader(
  doc: import('jspdf').jsPDF,
  subtitle: string,
  height: number = BRAND_HEADER_HEIGHT,
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, height, 'F');
  doc.setTextColor(255, 255, 255);

  const compact = height < BRAND_HEADER_HEIGHT;
  const titleSize = compact ? 9.5 : 11;
  const subtitleSize = compact ? 7 : 8;
  const baselineY = compact ? height * 0.72 : 8;

  doc.setFontSize(titleSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Lilia Paws Travel', PAGE_MARGIN, baselineY);
  const titleWidth = doc.getTextWidth('Lilia Paws Travel');

  doc.setFontSize(subtitleSize);
  doc.setFont('helvetica', 'normal');
  const subtitleX = compact ? PAGE_MARGIN + titleWidth + 4 : PAGE_MARGIN + 44;
  doc.text(subtitle, subtitleX, baselineY);
}
