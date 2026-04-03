import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactSubmission } from '@models/lib/contact-form.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonModule, ConfirmDialogModule, GenericTableComponent, TranslocoModule],
  templateUrl: './messages-list.component.html',
  styles: [],
})
export class MessagesListComponent implements OnInit {
  @Input() messages: ContactSubmission[] = [];
  @Output() rowClicked = new EventEmitter<ContactSubmission>();
  @Output() deleteClicked = new EventEmitter<ContactSubmission>();

  private confirmationService = inject(ConfirmationService);
  private transloco = inject(TranslocoService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  columns: TableColumn<ContactSubmission>[] = [];
  actions: TableAction<ContactSubmission>[] = [];
  tableConfig: TableConfig = {
    sortField: 'submittedAt',
    sortOrder: -1,
    paginator: false,
    striped: true,
    trackByField: 'id',
  };

  ngOnInit(): void {
    this.transloco.selectTranslation().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.tableConfig = {
        sortField: 'submittedAt',
        sortOrder: -1,
        paginator: false,
        striped: true,
        emptyMessage: this.transloco.translate('messages.table.empty'),
        trackByField: 'id',
      };
      this.columns = [
        { field: 'name', header: this.transloco.translate('messages.table.name'), sortable: true },
        { field: 'email', header: this.transloco.translate('messages.table.email'), sortable: true },
        {
          field: 'subject', header: this.transloco.translate('messages.table.subject'), sortable: true,
          formatter: (val) => (val as string) || '—',
        },
        { field: 'submittedAt', header: this.transloco.translate('messages.table.date'), sortable: true, type: 'date', dateFormat: 'dd/MM/yyyy HH:mm' },
        {
          field: 'isRead', header: this.transloco.translate('messages.table.status'), type: 'badge',
          badgeConfig: {
            severity: (val) => val ? 'secondary' : 'warn',
            label: (val) => val
              ? this.transloco.translate('messages.table.statusRead')
              : this.transloco.translate('messages.table.statusNew'),
          },
        },
      ];
      this.actions = [
        {
          icon: 'pi pi-trash',
          tooltip: this.transloco.translate('messages.table.deleteTooltip'),
          severity: 'danger',
          action: (msg) => this.confirmationService.confirm({
            header: this.transloco.translate('messages.confirmDelete.header'),
            message: this.transloco.translate('messages.confirmDelete.message', { name: msg.name }),
            acceptLabel: this.transloco.translate('messages.confirmDelete.accept'),
            rejectLabel: this.transloco.translate('messages.confirmDelete.reject'),
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.deleteClicked.emit(msg),
          }),
        },
      ];
      this.cdr.markForCheck();
    });
  }
}
