import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { loadMessages, loadMessageById, deleteMessage, selectAllMessages, selectMessagesIsLoading, selectSelectedMessage, selectUnreadCount } from '@admin/features/messages/store';
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
    CommonModule,
    ToastModule, CardModule, SkeletonModule,
    PageHeaderComponent, LoadingOverlayComponent,
    MessagesListComponent, MessageDetailDialogComponent,
  ],
  templateUrl: './messages-page.component.html',
  styleUrls: ['./messages-page.component.scss'],
})
export class MessagesPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly messageService = inject(MessageService);

  messages$ = this.store.select(selectAllMessages);
  loading$ = this.store.select(selectMessagesIsLoading);
  unreadCount$ = this.store.select(selectUnreadCount);

  selectedMessage = signal<ContactSubmission | null>(null);
  dialogVisible = signal(false);

  constructor() {
    this.store.select(selectSelectedMessage).pipe(
      filter(Boolean),
      takeUntilDestroyed(),
    ).subscribe((msg) => {
      this.selectedMessage.set(msg);
    });
  }

  ngOnInit(): void {
    this.store.dispatch(resetMessages());
    this.store.dispatch(loadMessages());
  }

  openMessage(msg: ContactSubmission): void {
    this.selectedMessage.set(msg);
    this.dialogVisible.set(true);
    if (!msg.isRead) {
      this.store.dispatch(loadMessageById({ id: msg.id }));
    }
  }

  onDialogVisibleChange(visible: boolean): void {
    this.dialogVisible.set(visible);
    if (!visible) this.selectedMessage.set(null);
  }

  deleteMessage(msg: ContactSubmission): void {
    this.store.dispatch(deleteMessage({ id: msg.id }));
    this.dialogVisible.set(false);
    this.selectedMessage.set(null);
    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Message deleted.' });
  }
}
