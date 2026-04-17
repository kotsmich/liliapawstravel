import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { Store } from '@ngrx/store';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { toSignal } from '@angular/core/rxjs-interop';
import { loadMessages, loadMessageById, deleteMessage, selectAllMessages, selectMessagesIsLoading, selectUnreadCount } from '@admin/features/messages/store';
import { resetMessages } from '@admin/core/store/notifications';
import { ContactSubmission } from '@models/lib/contact-form.model';
import { PageHeaderComponent } from '@ui/lib/components/page-header/page-header.component';
import { LoadingOverlayComponent } from '@ui/lib/components/loading/loading-overlay.component';
import { MessagesListComponent } from './components/messages-list/messages-list.component';
import { MessageDetailDialogComponent } from './components/message-detail-dialog/message-detail-dialog.component';

@Component({
  selector: 'app-messages-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ToastModule, CardModule, SkeletonModule,
    PageHeaderComponent, LoadingOverlayComponent,
    MessagesListComponent, MessageDetailDialogComponent,
    TranslocoModule,
  ],
  templateUrl: './messages-page.component.html',
  styleUrls: ['./messages-page.component.scss'],
})
export class MessagesPageComponent implements OnInit {
  private readonly store = inject(Store);

  readonly messages = toSignal(this.store.select(selectAllMessages), { initialValue: [] as ContactSubmission[] });
  readonly loading = toSignal(this.store.select(selectMessagesIsLoading), { initialValue: false });
  readonly unreadCount = toSignal(this.store.select(selectUnreadCount), { initialValue: 0 });

  private readonly selectedMessageId = signal<string | null>(null);
  readonly selectedMessage = computed(() => this.messages().find((message) => message.id === this.selectedMessageId()) ?? null);
  dialogVisible = signal(false);

  ngOnInit(): void {
    this.store.dispatch(resetMessages());
    this.store.dispatch(loadMessages());
  }

  openMessage(msg: ContactSubmission): void {
    this.selectedMessageId.set(msg.id);
    this.dialogVisible.set(true);
    if (!msg.isRead) {
      this.store.dispatch(loadMessageById({ id: msg.id }));
    }
  }

  onDialogVisibleChange(visible: boolean): void {
    this.dialogVisible.set(visible);
    if (!visible) this.selectedMessageId.set(null);
  }

  deleteMessage(msg: ContactSubmission): void {
    this.store.dispatch(deleteMessage({ id: msg.id }));
    this.dialogVisible.set(false);
    this.selectedMessageId.set(null);
  }
}
