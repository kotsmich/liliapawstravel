import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';
import { Dog } from '@models/lib/dog.model';
import {
  BRAND_COLOR,
  PAGE_MARGIN,
  fetchImageAsBase64,
  fitDimensions,
  drawBrandedHeader,
} from './pdf-export.utils';

@Injectable({ providedIn: 'root' })
export class DogBioExportService {
  async exportDogBioPdf(dog: Dog): Promise<void> {
    try {
      await this._buildAndDownload(dog);
    } catch (err) {
      console.error('Dog bio PDF export failed', err);
      throw new Error(`Failed to export PDF for "${dog.name ?? 'dog'}". Please try again.`);
    }
  }

  private async _buildAndDownload(dog: Dog): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth  = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - PAGE_MARGIN * 2;

    drawBrandedHeader(doc, 'Dog Bio');

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(dog.name ?? 'Dog Bio', PAGE_MARGIN, 24);
    doc.setDrawColor(...BRAND_COLOR);
    doc.setLineWidth(0.5);
    doc.line(PAGE_MARGIN, 27, pageWidth - PAGE_MARGIN, 27);

    const photoData = dog.photoUrl ? await fetchImageAsBase64(dog.photoUrl) : null;
    const detailsWidth  = photoData ? contentWidth * 0.55 : contentWidth;
    const photoColWidth = contentWidth - detailsWidth - 6;
    const photoX        = PAGE_MARGIN + detailsWidth + 6;

    autoTable(doc, {
      startY: 31,
      tableWidth: detailsWidth,
      head: [['Field', 'Value']],
      body: [
        ['Name',         dog.name          ?? '—'],
        ['Gender',       dog.gender        ?? '—'],
        ['Size',         dog.size ? dog.size.charAt(0).toUpperCase() + dog.size.slice(1) : '—'],
        ['Age',          dog.age != null   ? `${dog.age} yr` : '—'],
        ['Microchip ID', dog.chipId        ?? '—'],
        ['Pickup',       dog.pickupLocation ?? '—'],
        ['Drop',         dog.dropLocation  ?? '—'],
        ['Requester',    dog.requesterName ?? '—'],
        ['Notes',        dog.notes         || '—'],
      ],
      headStyles:         { fillColor: BRAND_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles:         { fontSize: 9, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [255, 248, 240] },
      columnStyles:       { 0: { cellWidth: 28, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
      margin:             { left: PAGE_MARGIN, right: pageWidth - PAGE_MARGIN - detailsWidth },
    });

    if (photoData) {
      const { w, h } = fitDimensions(photoData.width, photoData.height, photoColWidth, 100);
      doc.addImage(photoData.dataUrl, photoData.format, photoX, 31, w, h);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(photoX, 31, w, h);
    }

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Page 1 — Lilia Paws Travel — Confidential', pageWidth / 2, pageHeight - 5, { align: 'center' });

    // ── Page 2: append document via pdf-lib (only if document exists) ──
    const bioBytes = doc.output('arraybuffer');
    const merged   = await PDFDocument.load(bioBytes);

    await this._appendDocument(merged, dog);

    const finalBytes = await merged.save();
    const blob = new Blob([new Uint8Array(finalBytes)], { type: 'application/pdf' });
    const safeName = (dog.name ?? 'dog').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dog-bio-${safeName}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } // end _buildAndDownload

  private async _appendDocument(merged: PDFDocument, dog: Dog): Promise<void> {
    if (!dog.documentUrl) return;
    const response = await fetch(dog.documentUrl);
    if (!response.ok) {
      console.warn(`Could not fetch document for dog "${dog.name}" (${response.status}) — skipping document page.`);
      return;
    }
    const bytes = await response.arrayBuffer();
    if (dog.documentUrl.toLowerCase().includes('.pdf')) {
      await this._appendPdfBytes(merged, bytes);
    } else {
      await this._appendImageBytes(merged, bytes, dog.documentUrl);
    }
  }

  private async _appendPdfBytes(merged: PDFDocument, bytes: ArrayBuffer): Promise<void> {
    const src = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  private async _appendImageBytes(merged: PDFDocument, bytes: ArrayBuffer, url: string): Promise<void> {
    const imgData = await fetchImageAsBase64(url);
    if (!imgData) return;
    const a4W = 595, a4H = 842;
    const page = merged.addPage([a4W, a4H]);
    const embed = imgData.format === 'PNG'
      ? await merged.embedPng(bytes)
      : await merged.embedJpg(bytes);
    const { width: iW, height: iH } = embed.size();
    const scale = Math.min(a4W / iW, a4H / iH);
    page.drawImage(embed, {
      x: (a4W - iW * scale) / 2,
      y: (a4H - iH * scale) / 2,
      width: iW * scale,
      height: iH * scale,
    });
  }
}
