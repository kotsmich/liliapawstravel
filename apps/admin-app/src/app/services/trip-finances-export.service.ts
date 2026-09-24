import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { Trip } from '@models/lib/trip.model';
import {
  TripFinanceIncomeRow,
  TripFinanceRow,
  TripFinanceSummary,
} from '@models/lib/trip-finance.model';
import { BRAND_COLOR, PAGE_MARGIN, drawBrandedHeader, loadUnicodeFontIntoDoc } from './pdf-export.utils';

/** Everything the two finance PDFs print — the same rows and totals the panel shows. */
export interface TripFinancesExportData {
  trip: Trip;
  expenseRows: TripFinanceRow[];
  /** Each payer with what they owe and how much of it has arrived. */
  incomeRows: TripFinanceIncomeRow[];
  paymentRows: TripFinanceRow[];
  summary: TripFinanceSummary;
  paymentsTotal: number;
}

type Rgb = [number, number, number];

// Print equivalents of the admin theme tokens, so the PDF reads like the panel.
const GREEN: Rgb = [21, 128, 61];    // --color-success
const AMBER: Rgb = [180, 83, 9];     // --color-warning
const RED: Rgb = [185, 28, 28];      // --color-error-alt
const SLATE: Rgb = [71, 85, 105];    // --color-slate-mid
const TEXT: Rgb = [50, 50, 50];
const MUTED: Rgb = [130, 130, 130];
const ZEBRA: Rgb = [255, 248, 240];
const FOOT_FILL: Rgb = [253, 243, 232];
const BORDER: Rgb = [226, 232, 240];
const WHITE: Rgb = [255, 255, 255];
// Light fills for the remaining-balance result box.
const GREEN_TINT: Rgb = [240, 253, 244];
const RED_TINT: Rgb = [254, 242, 242];

/** First content line below the branded header and the meta block. */
const CONTENT_TOP = 30;
/** Top margin for continuation pages, which have no header bar. */
const CONTINUATION_TOP = 14;
/** Bottom margin — leaves room for the page footer. */
const BOTTOM_MARGIN = 14;
/**
 * Room needed below the incomes for the payments title, its subtitle, the table
 * head and one row — less than that and the title would sit orphaned.
 */
const MIN_PAYMENTS_START = 20;

/** Remaining-balance block: title cap height (4mm) + gap (4mm) + boxes (18mm). */
const BALANCE_BLOCK_HEIGHT = 26;
/** Clear space kept between the last table and the balance block. */
const BALANCE_BLOCK_GAP = 6;

/** How tightly a sheet's tables are set. */
interface SheetDensity {
  fontSize: number;
  cellPadding: number;
  /** Space between the incomes and the payments section, in mm. */
  sectionGap: number;
}

const NORMAL_DENSITY: SheetDensity = { fontSize: 8, cellPadding: 1.8, sectionGap: 8 };

/**
 * Tried in order until the incomes & payments sheet fits on one page. The last
 * step fits roughly 40+ rows across both tables; beyond that it paginates.
 */
const INCOMES_SHEET_DENSITIES = [
  NORMAL_DENSITY,
  { fontSize: 7, cellPadding: 1.1, sectionGap: 6 },
  { fontSize: 6.2, cellPadding: 0.7, sectionGap: 5 },
] as const satisfies readonly SheetDensity[];

/**
 * Greek, hardcoded rather than translated: the printed sheets are for the team
 * and the line items themselves are Greek, and admin-app translation is being
 * removed — so this deliberately doesn't hook into Transloco.
 */
const L = {
  expensesTitle: 'Έξοδα Ταξιδιού',
  incomesTitle: 'Έσοδα & Πληρωμές',
  tripDate: 'Ημερομηνία ταξιδιού',
  generated: 'Δημιουργήθηκε',
  income: 'ΕΣΟΔΑ',
  expenses: 'ΕΞΟΔΑ',
  profit: 'ΚΕΡΔΟΣ',
  payments: 'ΠΛΗΡΩΜΕΣ',
  remaining: 'ΥΠΟΛΟΙΠΟ',
  remainingTitle: 'Υπόλοιπο μετά από έξοδα και πληρωμές',
  total: 'ΣΥΝΟΛΟ',
  expense: 'Έξοδο',
  payer: 'Πληρωτής',
  paidTo: 'Προς',
  owed: 'Σύνολο',
  received: 'Εισπράχθηκε',
  remainingCol: 'Υπόλοιπο',
  note: 'Σημείωση',
  amount: 'Ποσό',
  noExpenses: 'Δεν υπάρχουν έξοδα με ποσό.',
  noIncomes: 'Δεν υπάρχουν πληρωτές σε αυτό το ταξίδι.',
  noPayments: 'Δεν έχουν καταγραφεί πληρωμές.',
  paymentsNotInProfit: '* Οι πληρωμές καταγράφονται χωριστά και δεν περιλαμβάνονται στο κέρδος.',
  paymentsLogOnly: 'Μόνο καταγραφή — δεν περιλαμβάνονται στο κέρδος.',
  hiddenZeroLines: (count: number) =>
    count === 1 ? '1 γραμμή με 0,00 € δεν εμφανίζεται.' : `${count} γραμμές με 0,00 € δεν εμφανίζονται.`,
  payersSummary: (paid: number, total: number) =>
    `${paid} από ${total} πληρωτές πλήρωσαν · ${total - paid} εκκρεμούν`,
  page: (current: number, total: number) => `Σελίδα ${current} / ${total}`,
};

const euro = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' });
const money = (value: number): string => euro.format(value);

/** `YYYY-MM-DD` → `DD/MM/YYYY` by splitting, so a timezone can never shift the day. */
const displayDate = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const finalY = (doc: jsPDF): number =>
  (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

@Injectable({ providedIn: 'root' })
export class TripFinancesExportService {
  /**
   * Builds both sheets, then saves both. Building first means a failure on the
   * second can't leave the admin holding only one of the pair.
   *
   * Two `save()` calls in a row may trigger the browser's "allow multiple
   * downloads" prompt the first time — that's the browser, not an error.
   */
  async exportFinancePdfs(data: TripFinancesExportData): Promise<void> {
    const expensesDoc = await this.buildExpensesPdf(data);
    const incomesDoc = await this.buildIncomesAndPaymentsPdf(data);

    const fileDate = displayDate(data.trip.date).replace(/\//g, '-');
    expensesDoc.save(`Εξοδα ${fileDate}.pdf`);
    incomesDoc.save(`Εσοδα-Πληρωμες ${fileDate}.pdf`);
  }

  // ── Expenses sheet ─────────────────────────────────────────────────────────

  private async buildExpensesPdf(data: TripFinancesExportData): Promise<jsPDF> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const font = await loadUnicodeFontIntoDoc(doc);
    const pageWidth = doc.internal.pageSize.getWidth();

    this.drawSheetHeader(doc, font, data.trip, L.expensesTitle);
    const cardsBottom = this.drawTotalsCards(doc, font, data.summary, data.paymentsTotal, CONTENT_TOP);

    // Zero lines are left out — most standard lines are unused on any given trip,
    // and a sheet of 0,00 rows buries the ones that matter. They're counted below
    // instead, so nothing disappears silently.
    const priced = data.expenseRows.filter((row) => (row.amount ?? 0) !== 0);
    const hiddenZeroLines = data.expenseRows.length - priced.length;

    const body: RowInput[] = priced.length
      ? priced.map((row, index): RowInput => [
          { content: String(index + 1), styles: { halign: 'center', textColor: MUTED } },
          row.displayName,
          row.note ?? '',
          { content: money(row.amount ?? 0), styles: { halign: 'right' } },
        ])
      : [[{ content: L.noExpenses, colSpan: 4, styles: { halign: 'center', textColor: MUTED } }]];

    autoTable(doc, {
      startY: cardsBottom + 6,
      head: [[
        { content: '#', styles: { halign: 'center' } },
        L.expense,
        L.note,
        { content: L.amount, styles: { halign: 'right' } },
      ]],
      body,
      foot: [[
        { content: L.total, colSpan: 3 },
        { content: money(data.summary.expenseTotal), styles: { halign: 'right' } },
      ]],
      showFoot: 'lastPage',
      ...this.tableTheme(font, BRAND_COLOR),
      columnStyles: {
        0: { cellWidth: 10 },
        2: { cellWidth: 62 },
        3: { cellWidth: 32 },
      },
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: CONTINUATION_TOP, bottom: BOTTOM_MARGIN },
    });

    let y = finalY(doc) + 6;
    const notes = [
      ...(hiddenZeroLines > 0 ? [L.hiddenZeroLines(hiddenZeroLines)] : []),
      L.paymentsNotInProfit,
    ];
    y = this.ensureSpace(doc, y, notes.length * 5);
    doc.setFont(font, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    for (const note of notes) {
      doc.text(note, PAGE_MARGIN, y);
      y += 5;
    }

    this.drawPageFooters(doc, font, pageWidth);
    return doc;
  }

  /**
   * Four tiles across the page. Payments is the fourth and is starred: it's a
   * total the admin wants on the sheet, but it is not part of the profit.
   * Returns the y just below the tiles.
   */
  private drawTotalsCards(
    doc: jsPDF,
    font: string,
    summary: TripFinanceSummary,
    paymentsTotal: number,
    top: number,
  ): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const gap = 4;
    const height = 17;
    const width = (pageWidth - PAGE_MARGIN * 2 - gap * 3) / 4;

    const cards: { label: string; value: number; color: Rgb }[] = [
      { label: L.income, value: summary.incomeTotal, color: GREEN },
      { label: L.expenses, value: summary.expenseTotal, color: AMBER },
      { label: L.profit, value: summary.profit, color: summary.profit < 0 ? RED : BRAND_COLOR },
      { label: `${L.payments}*`, value: paymentsTotal, color: SLATE },
    ];

    cards.forEach((card, index) => {
      const x = PAGE_MARGIN + index * (width + gap);

      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.3);
      doc.setFillColor(...WHITE);
      doc.roundedRect(x, top, width, height, 1.5, 1.5, 'FD');

      // Coloured accent down the left edge, mirroring the tiles in the panel.
      doc.setFillColor(...card.color);
      doc.rect(x, top, 1.4, height, 'F');

      doc.setFont(font, 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);
      doc.text(card.label, x + 4, top + 6);

      doc.setFontSize(12);
      doc.setTextColor(...card.color);
      doc.text(money(card.value), x + 4, top + 13.5);
    });

    return top + height;
  }

  // ── Incomes + payments sheet ───────────────────────────────────────────────

  /**
   * One page, with the balance at the bottom. Rendered at normal density first;
   * if the rows spill onto a second page it is re-rendered tighter, then tighter
   * again. The font is cached after the first load, so a re-render is cheap.
   *
   * Only a trip too large even for the tightest density goes past one page —
   * dropping payers to force the fit would be the worse bug.
   */
  private async buildIncomesAndPaymentsPdf(data: TripFinancesExportData): Promise<jsPDF> {
    const [first, ...tighter] = INCOMES_SHEET_DENSITIES;
    let doc = await this.renderIncomesAndPayments(data, first);
    for (const density of tighter) {
      if (doc.getNumberOfPages() === 1) break;
      doc = await this.renderIncomesAndPayments(data, density);
    }
    return doc;
  }

  private async renderIncomesAndPayments(
    data: TripFinancesExportData,
    density: SheetDensity,
  ): Promise<jsPDF> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const font = await loadUnicodeFontIntoDoc(doc);
    const pageWidth = doc.internal.pageSize.getWidth();

    // Both tables stop above the balance block, so it always fits under them on
    // the same page rather than being pushed onto a page of its own.
    const tableMargin = {
      left: PAGE_MARGIN,
      right: PAGE_MARGIN,
      top: CONTINUATION_TOP,
      bottom: BOTTOM_MARGIN + BALANCE_BLOCK_HEIGHT + BALANCE_BLOCK_GAP,
    };

    this.drawSheetHeader(doc, font, data.trip, L.incomesTitle);

    // ── Incomes: a collection checklist. Every requestor prints, paid or not,
    //    so the sheet answers "who still owes" at a glance.
    this.drawSectionTitle(doc, font, L.income, money(data.summary.incomeTotal), BRAND_COLOR, GREEN, CONTENT_TOP + 2);

    // The tiles carry what is owed, so what actually arrived is summed here.
    const receivedTotal =
      data.incomeRows.reduce((sum, row) => sum + Math.round(row.paid * 100), 0) / 100;
    const outstanding = Math.round((data.summary.incomeTotal - receivedTotal) * 100) / 100;
    const settledCount = data.incomeRows.filter((row) => row.remaining <= 0).length;

    const incomeBody: RowInput[] = data.incomeRows.length
      ? data.incomeRows.map((row) => this.incomeRow(row))
      : [[{ content: L.noIncomes, colSpan: 4, styles: { halign: 'center', textColor: MUTED } }]];

    autoTable(doc, {
      startY: CONTENT_TOP + 5,
      head: [[
        L.payer,
        { content: L.owed, styles: { halign: 'right' } },
        { content: L.received, styles: { halign: 'right' } },
        { content: L.remainingCol, styles: { halign: 'right' } },
      ]],
      body: incomeBody,
      foot: [[
        { content: L.total },
        { content: money(data.summary.incomeTotal), styles: { halign: 'right' } },
        { content: money(receivedTotal), styles: { halign: 'right' } },
        { content: money(outstanding), styles: { halign: 'right' } },
      ]],
      showFoot: 'lastPage',
      ...this.tableTheme(font, BRAND_COLOR, density),
      columnStyles: {
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
      },
      margin: tableMargin,
    });

    let y = finalY(doc) + 5;
    if (data.incomeRows.length) {
      doc.setFont(font, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...MUTED);
      doc.text(L.payersSummary(settledCount, data.incomeRows.length), PAGE_MARGIN, y);
      y += 4;
    }

    // ── Payments follow straight on. A fixed start lower down the page left
    //    room for only a couple of payments before forcing a second page.
    y += density.sectionGap;
    y = this.ensureSpace(doc, y, MIN_PAYMENTS_START, tableMargin.bottom);

    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.4);
    doc.line(PAGE_MARGIN, y - 5, pageWidth - PAGE_MARGIN, y - 5);

    // ── Payments: visually quieter (slate, not brand) — it's a log, not money in.
    this.drawSectionTitle(doc, font, L.payments, money(data.paymentsTotal), SLATE, SLATE, y);
    doc.setFont(font, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(L.paymentsLogOnly, PAGE_MARGIN, y + 4);

    // Same rule as the expenses sheet: standard lines with nothing recorded are
    // noise in print, so only payments with an amount reach the paper.
    const pricedPayments = data.paymentRows.filter((row) => (row.amount ?? 0) !== 0);

    const paymentBody: RowInput[] = pricedPayments.length
      ? pricedPayments.map((row): RowInput => [
          row.displayName,
          row.note ?? '',
          { content: money(row.amount ?? 0), styles: { halign: 'right' } },
        ])
      : [[{ content: L.noPayments, colSpan: 3, styles: { halign: 'center', textColor: MUTED } }]];

    autoTable(doc, {
      startY: y + 7,
      head: [[L.paidTo, L.note, { content: L.amount, styles: { halign: 'right' } }]],
      body: paymentBody,
      foot: [[
        { content: L.total, colSpan: 2 },
        { content: money(data.paymentsTotal), styles: { halign: 'right' } },
      ]],
      showFoot: 'lastPage',
      ...this.tableTheme(font, SLATE, density),
      columnStyles: {
        1: { cellWidth: 70 },
        2: { cellWidth: 30 },
      },
      margin: tableMargin,
    });

    this.drawRemainingBalance(doc, font, data.summary, data.paymentsTotal, finalY(doc));

    this.drawPageFooters(doc, font, pageWidth);
    return doc;
  }

  /**
   * What's actually left once everything is paid out: income − expenses −
   * payments. Deliberately its own figure, not ΚΕΡΔΟΣ — profit leaves payments
   * out. Laid out as the sum itself, so the number shows how it was reached.
   *
   * Pinned to the bottom of the page, like a statement's closing line. The
   * tables reserve this space, so it lands on the same page as them.
   */
  private drawRemainingBalance(
    doc: jsPDF,
    font: string,
    summary: TripFinanceSummary,
    paymentsTotal: number,
    contentBottom: number,
  ): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const blockTop = pageHeight - BOTTOM_MARGIN - BALANCE_BLOCK_HEIGHT;
    // The title's baseline sits 4mm under the block's top edge (its cap height).
    const y = blockTop + 4;

    // Safety net only: the tables' bottom margin already keeps this space clear,
    // so this fires just for a trip too large even at the tightest density.
    if (contentBottom + BALANCE_BLOCK_GAP > blockTop) {
      doc.addPage();
    }

    // Through cents, like the panel's totals, so 0.10 − 0.20 can't print -0,1000001.
    const remaining =
      Math.round((summary.incomeTotal - summary.expenseTotal - paymentsTotal) * 100) / 100;
    const negative = remaining < 0;

    doc.setFont(font, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...TEXT);
    doc.text(L.remainingTitle, PAGE_MARGIN, y);

    const boxTop = y + 4;
    const height = 18;
    const operatorWidth = 8;
    const available = pageWidth - PAGE_MARGIN * 2 - operatorWidth * 3;
    // Three equal terms and a wider result, so the answer carries the most weight.
    const termWidth = available / 4.3;
    const resultWidth = available - termWidth * 3;

    const terms: { label: string; value: number; color: Rgb }[] = [
      { label: L.income, value: summary.incomeTotal, color: GREEN },
      { label: L.expenses, value: summary.expenseTotal, color: AMBER },
      { label: L.payments, value: paymentsTotal, color: SLATE },
    ];

    let x = PAGE_MARGIN;
    terms.forEach((term, index) => {
      this.drawBalanceCell(doc, font, x, boxTop, termWidth, height, term.label, money(term.value), term.color, null);
      x += termWidth;
      this.drawOperator(doc, x, boxTop, operatorWidth, height, index < terms.length - 1 ? 'minus' : 'equals');
      x += operatorWidth;
    });

    this.drawBalanceCell(
      doc, font, x, boxTop, resultWidth, height,
      L.remaining, money(remaining),
      negative ? RED : GREEN,
      negative ? RED_TINT : GREEN_TINT,
    );
  }

  /** One box of the balance sum. A `fill` marks it as the result: tinted, bordered in its colour, larger. */
  private drawBalanceCell(
    doc: jsPDF,
    font: string,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    value: string,
    color: Rgb,
    fill: Rgb | null,
  ): void {
    doc.setLineWidth(fill ? 0.6 : 0.3);
    doc.setDrawColor(...(fill ? color : BORDER));
    doc.setFillColor(...(fill ?? WHITE));
    doc.roundedRect(x, y, width, height, 1.5, 1.5, 'FD');

    doc.setFont(font, 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    doc.text(label, x + width / 2, y + 6, { align: 'center' });

    doc.setFontSize(fill ? 12.5 : 10.5);
    doc.setTextColor(...color);
    doc.text(value, x + width / 2, y + 13.5, { align: 'center' });
  }

  /**
   * The − and = between boxes, drawn as lines rather than text: it looks the
   * same everywhere and doesn't depend on the font having the maths glyphs.
   */
  private drawOperator(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    kind: 'minus' | 'equals',
  ): void {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const half = 1.8;
    doc.setDrawColor(...MUTED);
    doc.setLineWidth(0.6);
    if (kind === 'minus') {
      doc.line(cx - half, cy, cx + half, cy);
    } else {
      doc.line(cx - half, cy - 0.9, cx + half, cy - 0.9);
      doc.line(cx - half, cy + 0.9, cx + half, cy + 0.9);
    }
  }

  private incomeRow(row: TripFinanceIncomeRow): RowInput {
    const settled = row.remaining <= 0;

    return [
      row.name,
      { content: money(row.total), styles: { halign: 'right' } },
      {
        content: money(row.paid),
        styles: { halign: 'right', textColor: row.paid > 0 ? GREEN : MUTED },
      },
      {
        // The column the admin chases: amber and bold while anything is owed,
        // quiet once the payer has settled up.
        content: money(row.remaining),
        styles: {
          halign: 'right',
          textColor: settled ? MUTED : AMBER,
          fontStyle: settled ? 'normal' : 'bold',
        },
      },
    ];
  }

  // ── Shared drawing ─────────────────────────────────────────────────────────

  private drawSheetHeader(doc: jsPDF, font: string, trip: Trip, title: string): void {
    const pageWidth = doc.internal.pageSize.getWidth();

    // The shared header draws its subtitle in helvetica, which has no Greek
    // glyphs — so it gets an empty subtitle and the Greek title is drawn here.
    drawBrandedHeader(doc, '');
    doc.setFont(font, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...WHITE);
    doc.text(title, pageWidth - PAGE_MARGIN, 8, { align: 'right' });

    // An en dash rather than an arrow: NotoSans has no arrow glyphs.
    doc.setFontSize(10);
    doc.setTextColor(...TEXT);
    doc.text(`${trip.departureCity} – ${trip.arrivalCity}`, PAGE_MARGIN, 18);

    doc.setFont(font, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(
      `${L.tripDate}: ${displayDate(trip.date)}   ·   ${L.generated}: ${new Date().toLocaleDateString('el-GR')}`,
      PAGE_MARGIN,
      23,
    );

    doc.setDrawColor(...BRAND_COLOR);
    doc.setLineWidth(0.5);
    doc.line(PAGE_MARGIN, 25.5, pageWidth - PAGE_MARGIN, 25.5);
  }

  /** Section label on the left, its total on the right, on one baseline. */
  private drawSectionTitle(
    doc: jsPDF,
    font: string,
    label: string,
    total: string,
    labelColor: Rgb,
    totalColor: Rgb,
    y: number,
  ): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFont(font, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...labelColor);
    doc.text(label, PAGE_MARGIN, y);
    doc.setTextColor(...totalColor);
    doc.text(total, pageWidth - PAGE_MARGIN, y, { align: 'right' });
  }

  private tableTheme(font: string, headColor: Rgb, density: SheetDensity = NORMAL_DENSITY) {
    const { fontSize, cellPadding } = density;
    return {
      styles: { font, fontSize, cellPadding, lineColor: BORDER, lineWidth: 0 },
      headStyles: { font, fontStyle: 'bold' as const, fillColor: headColor, textColor: WHITE, fontSize },
      bodyStyles: { font, textColor: TEXT, valign: 'middle' as const },
      footStyles: { font, fontStyle: 'bold' as const, fillColor: FOOT_FILL, textColor: TEXT, fontSize: fontSize + 0.5 },
      alternateRowStyles: { fillColor: ZEBRA },
    };
  }

  /** Starts a new page when `needed` mm won't fit above `bottom` (the footer margin by default). */
  private ensureSpace(doc: jsPDF, y: number, needed: number, bottom = BOTTOM_MARGIN): number {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + needed <= pageHeight - bottom) return y;
    doc.addPage();
    return CONTINUATION_TOP + 6;
  }

  /**
   * Drawn once at the end rather than per page, so every footer can say
   * "page X of Y" — the total isn't known while autoTable is still paginating.
   */
  private drawPageFooters(doc: jsPDF, font: string, pageWidth: number): void {
    const pageHeight = doc.internal.pageSize.getHeight();
    const total = doc.getNumberOfPages();
    for (let page = 1; page <= total; page++) {
      doc.setPage(page);
      doc.setFont(font, 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text(`Lilia Paws Travel · ${L.page(page, total)}`, pageWidth / 2, pageHeight - 6, {
        align: 'center',
      });
    }
  }
}
