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
import { MessagesListComponent } from './components/messages-list/messages-list.component';
import { MessageDetailDialogComponent } from './components/message-detail-dialog/message-detail-dialog.component';

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule, CardModule, SkeletonModule,
    MessagesListComponent, MessageDetailDialogComponent,
  ],
  template: `
    <p-toast />
    <div class="messages-page">
      <div class="page-header flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h1>Messages</h1>
          @if ((unreadCount$ | async); as unread) {
            <span class="unread-label">{{ unread }} unread</span>
          }
        </div>
      </div>

      @if (loading$ | async) {
        <p-skeleton height="3rem" styleClass="mb-2" />
        <p-skeleton height="3rem" styleClass="mb-2" />
        <p-skeleton height="3rem" />
      } @else {
        <p-card>
          <app-messages-list
            [messages]="(messages$ | async) ?? []"
            (rowClicked)="openMessage($event)"
            (deleteClicked)="deleteMessage($event)"
            />
        </p-card>
      }
    </div>

    <app-message-detail-dialog
      [message]="selectedMessage"
      [visible]="dialogVisible"
      (visibleChange)="onDialogVisibleChange($event)"
      (deleteClicked)="deleteMessage($event)"
      />
  `,
  styles: [`
    .messages-page { padding: 1.5rem; }
    @media (max-width: 480px) { .messages-page { padding: 1rem; } }
    .page-header { margin-bottom: 1.5rem; h1 { margin: 0; font-size: 1.5rem; font-weight: 600; } }
    .unread-label { font-size: 0.85rem; color: #f59e0b; font-weight: 600; margin-top: 0.25rem; display: block; }
  `],
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
