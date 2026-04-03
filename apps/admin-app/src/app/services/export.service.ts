import { inject, Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Store } from '@ngrx/store';
import { filter, firstValueFrom, map } from 'rxjs';
import { Trip } from '@models/lib/trip.model';
import { loadTripById, selectAllTrips } from '@admin/features/trips/store';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly store = inject(Store);

  async exportTripById(tripId: string): Promise<void> {
    this.store.dispatch(loadTripById({ id: tripId }));
    const trip = await firstValueFrom(
      this.store.select(selectAllTrips).pipe(
        map((trips) => trips.find((t) => t.id === tripId)),
        filter((t): t is Trip => t?.dogs !== undefined),
      )
    );
    this.exportTripManifestPdf(trip);
  }

  exportTripManifestPdf(trip: Trip): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Branded header bar — compact (≈50px / ~18mm)
    doc.setFillColor(224, 123, 84);
    doc.rect(0, 0, pageWidth, 12, 'F');

    // Company name + title on same line
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Lilia Paws Travel', 14, 8);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Trip Dog Manifest', 14 + 44, 8);

    // Trip info block — single line, small font
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(7.5);

    const tripDate = new Date(trip.date).toLocaleDateString('el-GR');
    const route =
      `${trip.departureCity}, ${trip.departureCountry}` +
      ` → ` +
      `${trip.arrivalCity}, ${trip.arrivalCountry}`;

    doc.text(`Date: ${tripDate}   Route: ${route}`, 14, 17);
    doc.text(
      `Dogs: ${trip.dogs?.length ?? 0}/${trip.totalCapacity}   Status: ${trip.status.toUpperCase()}   Generated: ${new Date().toLocaleDateString('el-GR')}`,
      14, 22
    );

    // Divider line
    doc.setDrawColor(224, 123, 84);
    doc.setLineWidth(0.5);
    doc.line(14, 25, pageWidth - 14, 25);

    // Dogs table
    autoTable(doc, {
      startY: 28,
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
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 24 },
        2: { cellWidth: 14 },
        3: { cellWidth: 10 },
        4: { cellWidth: 28 },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 },
        7: { cellWidth: 40 }
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
