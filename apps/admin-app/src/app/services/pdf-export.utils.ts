/** Shared constants and helpers for PDF export services. */

export const BRAND_COLOR: [number, number, number] = [224, 123, 84];
export const BRAND_HEADER_HEIGHT = 12;
export const PAGE_MARGIN = 14;

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

export function drawBrandedHeader(doc: import('jspdf').jsPDF, subtitle: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, BRAND_HEADER_HEIGHT, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Lilia Paws Travel', PAGE_MARGIN, 8);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, PAGE_MARGIN + 44, 8);
}
