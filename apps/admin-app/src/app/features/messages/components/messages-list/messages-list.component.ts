import { Component, ChangeDetectionStrategy, inject, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContactSubmission } from '@models/lib/contact-form.model';
import { TableColumn, TableAction, TableConfig } from '@models/lib/table-column.interface';
import { GenericTableComponent } from '@ui/lib/components/table/generic-table.component';
import { ConfirmActionService } from '@admin/shared/services/confirm-action.service';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, ConfirmDialogModule, GenericTableComponent, TranslocoModule],
  templateUrl: './messages-list.component.html',
  styleUrl: './messages-list.component.scss',
})
export class MessagesListComponent {
  readonly messages = input<ContactSubmission[]>([]);
  readonly rowClicked = output<ContactSubmission>();
  readonly deleteClicked = output<ContactSubmission>();

  private readonly confirm = inject(ConfirmActionService);
  private readonly transloco = inject(TranslocoService);
  private readonly _t = toSignal(this.transloco.selectTranslation(), { initialValue: null });

  readonly tableConfig = computed((): TableConfig => {
    this._t();
    return {
      sortField: 'submittedAt',
      sortOrder: -1,
      paginator: false,
      striped: true,
      emptyMessage: this.transloco.translate('messages.table.empty'),
      trackByField: 'id',
    };
  });

  readonly columns = computed((): TableColumn<ContactSubmission>[] => {
    this._t();
    return [
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
  });

  readonly actions = computed((): TableAction<ContactSubmission>[] => {
    this._t();
    return [
      {
        icon: 'pi pi-trash',
        tooltip: this.transloco.translate('messages.table.deleteTooltip'),
        severity: 'danger',
        action: (msg) => this.confirm.confirm({
          header:      this.transloco.translate('messages.confirmDelete.header'),
          message:     this.transloco.translate('messages.confirmDelete.message', { name: msg.name }),
          acceptLabel: this.transloco.translate('messages.confirmDelete.accept'),
          rejectLabel: this.transloco.translate('messages.confirmDelete.reject'),
          severity:    'danger',
          accept: () => this.deleteClicked.emit(msg),
        }),
      },
    ];
  });
}
