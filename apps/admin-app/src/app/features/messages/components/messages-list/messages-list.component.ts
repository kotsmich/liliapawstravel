import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ContactSubmission } from '@models/lib/contact-form.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, ButtonModule, ConfirmDialogModule, GenericTableComponent],
  templateUrl: './messages-list.component.html',
  styles: [],
})
export class MessagesListComponent implements OnInit {
  @Input() messages: ContactSubmission[] = [];
  @Output() rowClicked = new EventEmitter<ContactSubmission>();
  @Output() deleteClicked = new EventEmitter<ContactSubmission>();

  constructor(private confirmationService: ConfirmationService) {}

  columns: TableColumn<ContactSubmission>[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    {
      field: 'subject', header: 'Subject', sortable: true,
      formatter: (val) => (val as string) || '—',
    },
    { field: 'submittedAt', header: 'Date', sortable: true, type: 'date', dateFormat: 'dd/MM/yyyy HH:mm' },
    {
      field: 'isRead', header: 'Status', type: 'badge',
      badgeConfig: {
        severity: (val) => val ? 'secondary' : 'warn',
        label: (val) => val ? 'Read' : 'New',
      },
    },
  ];

  actions: TableAction<ContactSubmission>[] = [];

  tableConfig: TableConfig = {
    sortField: 'submittedAt',
    sortOrder: -1,
    paginator: false,
    striped: true,
    emptyMessage: 'No messages yet.',
    trackByField: 'id',
  };

  ngOnInit(): void {
    this.actions = [
      {
        icon: 'pi pi-trash', tooltip: 'Delete', severity: 'danger',
        action: (msg) => this.confirmationService.confirm({
          header: 'Delete Message',
          message: `Delete message from ${msg.name}?`,
          acceptLabel: 'Delete',
          rejectLabel: 'Cancel',
          acceptButtonStyleClass: 'p-button-danger',
          accept: () => this.deleteClicked.emit(msg),
        }),
      },
    ];
  }
}
