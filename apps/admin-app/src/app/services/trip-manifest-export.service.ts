import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Trip } from '@models/lib/trip.model';
import { BRAND_COLOR, PAGE_MARGIN, drawBrandedHeader } from './pdf-export.utils';

@Injectable({ providedIn: 'root' })
export class TripManifestExportService {
  exportTripManifestPdf(trip: Trip): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    drawBrandedHeader(doc, 'Trip Dog Manifest');

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(7.5);

    const tripDate = new Date(trip.date).toLocaleDateString('el-GR');
    const route =
      `${trip.departureCity}, ${trip.departureCountry}` +
      ` → ` +
      `${trip.arrivalCity}, ${trip.arrivalCountry}`;

    doc.text(`Date: ${tripDate}   Route: ${route}`, PAGE_MARGIN, 17);
    doc.text(
      `Dogs: ${trip.dogs?.length ?? 0}/${trip.totalCapacity}   Status: ${trip.status.toUpperCase()}   Generated: ${new Date().toLocaleDateString('el-GR')}`,
      PAGE_MARGIN, 22
    );

    doc.setDrawColor(...BRAND_COLOR);
    doc.setLineWidth(0.5);
    doc.line(PAGE_MARGIN, 25, pageWidth - PAGE_MARGIN, 25);

    autoTable(doc, {
      startY: 28,
      head: [['#', 'Dog Name', 'Size', 'Age', 'Microchip ID', 'Pickup Location', 'Drop Location', 'Notes']],
      body: (trip.dogs ?? []).map((dog, index) => [
        index + 1,
        dog.name ?? '',
        dog.size ? dog.size.charAt(0).toUpperCase() + dog.size.slice(1) : '',
        dog.age ?? '',
        dog.chipId ?? '',
        dog.pickupLocation ?? '',
        dog.dropLocation ?? '',
        dog.notes ?? '',
      ]),
      headStyles:         { fillColor: BRAND_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, halign: 'left' },
      bodyStyles:         { fontSize: 8, textColor: [50, 50, 50], valign: 'middle' },
      alternateRowStyles: { fillColor: [255, 248, 240] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 24 },
        2: { cellWidth: 14 },
        3: { cellWidth: 10 },
        4: { cellWidth: 28 },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 },
        7: { cellWidth: 40 },
      },
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      didDrawPage: (pageData) => {
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${pageData.pageNumber} — Lilia Paws Travel — Confidential`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 5,
          { align: 'center' }
        );
      },
    });

    if (!trip.dogs?.length) {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('No dogs assigned to this trip yet.', pageWidth / 2, 80, { align: 'center' });
    }

    const safeName = route.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    doc.save(`trip-manifest-${tripDate}-${safeName}.pdf`);
  }
}
