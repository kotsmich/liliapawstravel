import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Trip } from '@models/lib/trip.model';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportTripManifestPdf(trip: Trip): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Branded header bar
    doc.setFillColor(224, 123, 84);
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Lilia Paws Travel', 14, 12);

    // Document title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Trip Dog Manifest', 14, 21);

    // Trip info block
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);

    const tripDate = new Date(trip.date).toLocaleDateString('el-GR');
    const route =
      `${trip.departureCity}, ${trip.departureCountry}` +
      ` → ` +
      `${trip.arrivalCity}, ${trip.arrivalCountry}`;

    doc.text(`Date: ${tripDate}`, 14, 36);
    doc.text(`Route: ${route}`, 14, 42);
    doc.text(
      `Total Dogs: ${trip.dogs?.length ?? 0} / ${trip.totalCapacity}`,
      14, 48
    );
    doc.text(`Status: ${trip.status.toUpperCase()}`, 14, 54);
    doc.text(
      `Generated: ${new Date().toLocaleDateString('el-GR')}`,
      pageWidth - 14,
      54,
      { align: 'right' }
    );

    // Divider line
    doc.setDrawColor(224, 123, 84);
    doc.setLineWidth(0.5);
    doc.line(14, 58, pageWidth - 14, 58);

    // Dogs table
    autoTable(doc, {
      startY: 63,
      head: [[
        '#',
        'Dog Name',
        'Size',
        'Age',
        'Microchip ID',
        'Pickup Location',
        'Drop Location',
        'Notes'
      ]],
      body: (trip.dogs ?? []).map((dog, index) => [
        index + 1,
        dog.name ?? '',
        dog.size
          ? dog.size.charAt(0).toUpperCase() + dog.size.slice(1)
          : '',
        dog.age ?? '',
        dog.chipId ?? '',
        dog.pickupLocation ?? '',
        dog.dropLocation ?? '',
        dog.notes ?? ''
      ]),
      headStyles: {
        fillColor: [224, 123, 84],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [50, 50, 50],
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [255, 248, 240]
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 28 },
        2: { cellWidth: 18 },
        3: { cellWidth: 12 },
        4: { cellWidth: 30 },
        5: { cellWidth: 40 },
        6: { cellWidth: 40 },
        7: { cellWidth: 'auto' }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (d) => {
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${d.pageNumber} — Lilia Paws Travel — Confidential`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 5,
          { align: 'center' }
        );
      }
    });

    // Empty state message if no dogs
    if (!trip.dogs?.length) {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(
        'No dogs assigned to this trip yet.',
        pageWidth / 2,
        80,
        { align: 'center' }
      );
    }

    const safeName = route.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    doc.save(`trip-manifest-${tripDate}-${safeName}.pdf`);
  }
}
