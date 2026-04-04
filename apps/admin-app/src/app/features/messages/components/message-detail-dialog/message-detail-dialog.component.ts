import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ContactSubmission } from '@models/lib/contact-form.model';

@Component({
  selector: 'app-message-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DialogModule, ButtonModule, TagModule, CardModule, TranslocoModule],
  templateUrl: './message-detail-dialog.component.html',
  styleUrls: ['./message-detail-dialog.component.scss'],
})
export class MessageDetailDialogComponent {
  @Input() visible = false;
  @Input() message: ContactSubmission | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() deleteClicked = new EventEmitter<ContactSubmission>();
}
