import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ContactSubmission } from '@models/lib/contact-form.model';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, TableModule, ButtonModule, TagModule, ConfirmDialogModule],
  template: `
    <p-confirmDialog />
    <div style="overflow-x:auto">
      <p-table
        [value]="messages"
        [tableStyle]="{ 'min-width': '52rem' }"
        [sortField]="'submittedAt'"
        [sortOrder]="-1"
        styleClass="p-datatable-sm p-datatable-striped"
        rowHover
        >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name">Name <p-sortIcon field="name" /></th>
            <th pSortableColumn="email">Email <p-sortIcon field="email" /></th>
            <th pSortableColumn="subject">Subject <p-sortIcon field="subject" /></th>
            <th pSortableColumn="submittedAt">Date <p-sortIcon field="submittedAt" /></th>
            <th>Status</th>
            <th style="width:4rem"></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-msg>
          <tr style="cursor:pointer" (click)="rowClicked.emit(msg)">
            <td>{{ msg.name }}</td>
            <td>{{ msg.email }}</td>
            <td>{{ msg.subject || '—' }}</td>
            <td>{{ msg.submittedAt | date:'dd/MM/yyyy HH:mm' }}</td>
            <td>
              @if (!msg.isRead) {
                <p-tag severity="warn" value="New" />
              } @else {
                <p-tag severity="secondary" value="Read" />
              }
            </td>
            <td>
              <p-button
                icon="pi pi-trash"
                severity="danger"
                [text]="true"
                [rounded]="true"
                size="small"
                pTooltip="Delete"
                (onClick)="confirmDelete($event, msg)"
                />
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" style="text-align:center;padding:2rem;color:#94a3b8">No messages yet.</td></tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [],
})
export class MessagesListComponent {
  @Input() messages: ContactSubmission[] = [];
  @Output() rowClicked = new EventEmitter<ContactSubmission>();
  @Output() deleteClicked = new EventEmitter<ContactSubmission>();

  constructor(private confirmationService: ConfirmationService) {}

  confirmDelete(event: Event, msg: ContactSubmission): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      header: 'Delete Message',
      message: `Delete message from ${msg.name}?`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteClicked.emit(msg),
    });
  }
}
