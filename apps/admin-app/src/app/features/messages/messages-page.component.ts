import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { MessagesActions, selectAllMessages, selectMessagesIsLoading, selectSelectedMessage, selectUnreadCount } from '@admin/store/messages';
import { ContactSubmission } from '@models/lib/contact-form.model';
import { PageHeaderComponent } from '@ui/lib/components/page-header/page-header.component';
import { LoadingOverlayComponent } from '@ui/lib/components/loading/loading-overlay.component';
import { MessagesListComponent } from './components/messages-list/messages-list.component';
import { MessageDetailDialogComponent } from './components/message-detail-dialog/message-detail-dialog.component';

@Component({
  selector: 'app-messages-page',
  standalone: true,
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
  messages$ = this.store.select(selectAllMessages);
  loading$ = this.store.select(selectMessagesIsLoading);
  unreadCount$ = this.store.select(selectUnreadCount);

  selectedMessage: ContactSubmission | null = null;
  dialogVisible = false;

  constructor(private store: Store, private messageService: MessageService) {
    this.store.select(selectSelectedMessage).pipe(
      filter(Boolean),
      takeUntilDestroyed(),
    ).subscribe((msg) => {
      this.selectedMessage = msg;
    });
  }

  ngOnInit(): void {
    this.store.dispatch(MessagesActions.loadMessages());
  }

  openMessage(msg: ContactSubmission): void {
    this.selectedMessage = msg;
    this.dialogVisible = true;
    if (!msg.isRead) {
      this.store.dispatch(MessagesActions.loadMessageById({ id: msg.id }));
    }
  }

  onDialogVisibleChange(visible: boolean): void {
    this.dialogVisible = visible;
    if (!visible) this.selectedMessage = null;
  }

  deleteMessage(msg: ContactSubmission): void {
    this.store.dispatch(MessagesActions.deleteMessage({ id: msg.id }));
    this.dialogVisible = false;
    this.selectedMessage = null;
    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Message deleted.' });
  }
}
