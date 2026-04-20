import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Trip } from '@models/lib/trip.model';
import { DogGroup } from '@admin/features/trips/shared/dog-group.model';
import { BRAND_COLOR, PAGE_MARGIN, drawBrandedHeader, loadUnicodeFontIntoDoc } from './pdf-export.utils';

const DOG_TABLE_HEAD = [['#', 'Dog Name', 'Size', 'Age', 'Microchip ID', 'Pickup Location', 'Drop Location', 'Notes']];
const DOG_TABLE_COLUMN_STYLES = {
  0: { cellWidth: 10, halign: 'center' as const },
  1: { cellWidth: 24 },
  2: { cellWidth: 14 },
  3: { cellWidth: 10 },
  4: { cellWidth: 28 },
  5: { cellWidth: 30 },
  6: { cellWidth: 30 },
  7: { cellWidth: 40 },
};

function dogRow(dog: { name?: string; size?: string; age?: number; chipId?: string; pickupLocation?: string; dropLocation?: string; notes?: string }, index: number): (string | number)[] {
  return [
    index + 1,
    dog.name ?? '',
    dog.size ? dog.size.charAt(0).toUpperCase() + dog.size.slice(1) : '',
    dog.age ?? '',
    dog.chipId ?? '',
    dog.pickupLocation ?? '',
    dog.dropLocation ?? '',
    dog.notes ?? '',
  ];
}

function tripMetaLines(doc: jsPDF, trip: Trip, pageWidth: number): { tripDate: string; route: string } {
  const tripDate = new Date(trip.date).toLocaleDateString('el-GR');
  const route =
    `${trip.departureCity}, ${trip.departureCountry}` +
    ` → ` +
    `${trip.arrivalCity}, ${trip.arrivalCountry}`;

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(7.5);
  doc.text(`Date: ${tripDate}   Route: ${route}`, PAGE_MARGIN, 17);
  doc.text(
    `Dogs: ${trip.dogs?.length ?? 0}/${trip.totalCapacity}   Status: ${trip.status.toUpperCase()}   Generated: ${new Date().toLocaleDateString('el-GR')}`,
    PAGE_MARGIN, 22
  );
  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(0.5);
  doc.line(PAGE_MARGIN, 25, pageWidth - PAGE_MARGIN, 25);

  return { tripDate, route };
}

function pageFooterFn(doc: jsPDF, pageWidth: number) {
  return (pageData: { pageNumber: number }) => {
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${pageData.pageNumber} — Lilia Paws Travel — Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );
  };
}

@Injectable({ providedIn: 'root' })
export class TripManifestExportService {
  async exportTripManifestPdf(trip: Trip): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const font = await loadUnicodeFontIntoDoc(doc);

    drawBrandedHeader(doc, 'Trip Dog Manifest');
    const { tripDate, route } = tripMetaLines(doc, trip, pageWidth);

    doc.setFont(font, 'normal');

    autoTable(doc, {
      startY: 28,
      head: DOG_TABLE_HEAD,
      body: (trip.dogs ?? []).map((dog, i) => dogRow(dog, i)),
      styles:             { font },
      headStyles:         { font, fillColor: BRAND_COLOR, textColor: [255, 255, 255], fontSize: 8, halign: 'left' },
      bodyStyles:         { font, fontSize: 8, textColor: [50, 50, 50], valign: 'middle' },
      alternateRowStyles: { fillColor: [255, 248, 240] },
      columnStyles:       DOG_TABLE_COLUMN_STYLES,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      didDrawPage: pageFooterFn(doc, pageWidth),
    });

    if (!trip.dogs?.length) {
      doc.setFont(font, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('No dogs assigned to this trip yet.', pageWidth / 2, 80, { align: 'center' });
    }

    const safeName = route.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    doc.save(`trip-manifest-${tripDate}-${safeName}.pdf`);
  }

  async exportGroupedManifestPdf(trip: Trip, groups: DogGroup[], groupingType: string): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const font = await loadUnicodeFontIntoDoc(doc);

    drawBrandedHeader(doc, `Trip Dog Manifest — By ${groupingType}`);
    const { tripDate, route } = tripMetaLines(doc, trip, pageWidth);

    doc.setFont(font, 'normal');

    let startY = 28;

    for (const group of groups) {
      doc.setFontSize(9);
      doc.setFont(font, 'normal');
      doc.setTextColor(...BRAND_COLOR);
      doc.text(group.label, PAGE_MARGIN, startY + 5);

      if (!group.dogs.length) {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('No dogs in this group', PAGE_MARGIN + 2, startY + 12);
        startY += 18;
        continue;
      }

      autoTable(doc, {
        startY: startY + 8,
        head: DOG_TABLE_HEAD,
        body: group.dogs.map((dog, i) => dogRow(dog, i)),
        styles:             { font },
        headStyles:         { font, fillColor: BRAND_COLOR, textColor: [255, 255, 255], fontSize: 8, halign: 'left' },
        bodyStyles:         { font, fontSize: 8, textColor: [50, 50, 50], valign: 'middle' },
        alternateRowStyles: { fillColor: [255, 248, 240] },
        columnStyles:       DOG_TABLE_COLUMN_STYLES,
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
        didDrawPage: pageFooterFn(doc, pageWidth),
      });

      startY = (doc as any).lastAutoTable.finalY + 8;
    }

    const safeName = route.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const safeGrouping = groupingType.toLowerCase().replace(/\s+/g, '-');
    doc.save(`trip-manifest-${tripDate}-${safeName}-by-${safeGrouping}.pdf`);
  }
}
