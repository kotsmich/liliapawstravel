import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ContactSubmission } from '@models/lib/contact-form.model';

@Component({
  selector: 'app-message-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, DialogModule, ButtonModule, TagModule, CardModule],
  template: `
    <p-dialog
      header="Message Details"
      [visible]="visible"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [style]="{ width: '620px', maxWidth: '95vw' }"
      [draggable]="false"
      >
      @if (message; as msg) {
        <div class="detail-section">
          <h3>Sender</h3>
          <div class="sender-grid">
            <p><i class="pi pi-user"></i> <strong>Name:</strong> {{ msg.name }}</p>
            <p><i class="pi pi-envelope"></i> <strong>Email:</strong> {{ msg.email }}</p>
            @if (msg.phone) {
              <p><i class="pi pi-phone"></i> <strong>Phone:</strong> {{ msg.phone }}</p>
            }
          </div>
        </div>

        <div class="detail-section">
          <h3>{{ msg.subject || 'No subject' }}</h3>
          <div class="message-body">{{ msg.message }}</div>
        </div>

        <div class="detail-section meta-row">
          <p><i class="pi pi-calendar"></i> Submitted: {{ msg.submittedAt | date:'dd/MM/yyyy HH:mm' }}</p>
          @if (!msg.isRead) {
            <p-tag severity="warn" value="New" />
          } @else {
            <p-tag severity="secondary" value="Read" />
          }
        </div>
      }

      <ng-template pTemplate="footer">
        <p-button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          [outlined]="true"
          (onClick)="deleteClicked.emit(message!)"
          />
        <p-button
          label="Close"
          icon="pi pi-times"
          severity="secondary"
          [outlined]="true"
          (onClick)="visibleChange.emit(false)"
          />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .detail-section {
      margin-bottom: 1.25rem;
      h3 { margin: 0 0 0.5rem; font-size: 1rem; font-weight: 600; color: var(--p-primary-600, #c47c3e); border-bottom: 1px solid var(--p-surface-200, #e2e8f0); padding-bottom: 0.25rem; }
      p { margin: 0.25rem 0; font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem; }
      i { color: var(--p-primary-500, #e07b54); }
    }
    .sender-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem 1rem; }
    @media (max-width: 480px) { .sender-grid { grid-template-columns: 1fr; } }
    .message-body {
      background: var(--p-surface-50, #f8fafc);
      border-radius: 8px;
      padding: 1rem;
      font-size: 0.9rem;
      line-height: 1.7;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .meta-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
  `],
})
export class MessageDetailDialogComponent {
  @Input() visible = false;
  @Input() message: ContactSubmission | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() deleteClicked = new EventEmitter<ContactSubmission>();
}
