import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { DocumentExportDialogComponent } from '@user/shared/components/document-export-dialog/document-export-dialog.component';

@Component({
  selector: 'app-transport-documents',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, TranslocoModule, ButtonModule, AccordionModule, DocumentExportDialogComponent],
  templateUrl: './transport-documents.component.html',
  styleUrls: ['./transport-documents.component.scss'],
})
export class TransportDocumentsComponent {
  private readonly exportDialog = viewChild.required('exportDialog', { read: DocumentExportDialogComponent });

  readonly howWeWorkParagraphs = [
    'transportDocuments.howWeWork.p1',
    'transportDocuments.howWeWork.p2',
    'transportDocuments.howWeWork.p3',
  ];

  readonly faqItems = [0, 1, 2, 3, 4].map((i) => ({
    questionKey: `transportDocuments.faq.items.${i}.question`,
    answerKey: `transportDocuments.faq.items.${i}.answer`,
    value: i.toString(),
  }));

  openDialog(): void {
    this.exportDialog().open();
  }
}
