import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { selectIsAuthenticated } from '@admin/store/auth';
import { TripRequestActions } from '@admin/store/requests';
import { MessagesActions } from '@admin/store/messages';
import { NotificationsActions, selectTotalCount } from '@admin/store/notifications';
import { AppWebSocketService } from '@ui/lib/websocket/app-websocket.service';
import { SocketEvent } from '@models/lib/socket-events.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { ContactSubmission } from '@models/lib/contact-form.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ToastModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly destroyRef = inject(DestroyRef);
  private socketInitialized = false;

  constructor(
    private readonly store: Store,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly messageService: MessageService,
    private readonly wsService: AppWebSocketService,
  ) {
    this.initRouteReset();
    this.initTitleCounter();
    this.initSocketAfterAuth();
  }

  private initSocketAfterAuth(): void {
    this.store
      .select(selectIsAuthenticated)
      .pipe(
        filter((auth) => auth && !this.socketInitialized),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.socketInitialized = true;
        this.wsService.connect();
        this.initSocketListeners();
      });
  }

  private initSocketListeners(): void {
    this.wsService
      .listen<TripRequest>(SocketEvent.REQUEST_NEW)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((request) => {
        this.store.dispatch(TripRequestActions.addRequestFromSocket({ request }));
        this.store.dispatch(NotificationsActions.increment({ notificationType: 'requests' }));
        this.messageService.add({
          severity: 'info',
          summary: 'New Request',
          detail: `New request from ${request.requesterName}`,
          life: 5000,
        });
      });

    this.wsService
      .listen<TripRequest>(SocketEvent.REQUEST_UPDATED)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((request) => {
        this.store.dispatch(TripRequestActions.updateRequestStatusSuccess({ request }));
      });

    this.wsService
      .listen<ContactSubmission>(SocketEvent.MESSAGE_NEW)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => {
        this.store.dispatch(MessagesActions.addMessageFromSocket({ message }));
        this.store.dispatch(NotificationsActions.increment({ notificationType: 'messages' }));
        this.messageService.add({
          severity: 'info',
          summary: 'New Message',
          detail: `Message from ${message.name}`,
          life: 5000,
        });
      });
  }

  private initRouteReset(): void {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => {
        const url = (e as NavigationEnd).url;
        if (url.includes('/requests')) {
          this.store.dispatch(NotificationsActions.resetRequests());
        }
        if (url.includes('/messages')) {
          this.store.dispatch(NotificationsActions.resetMessages());
        }
      });
  }

  private initTitleCounter(): void {
    this.store
      .select(selectTotalCount)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((count) => {
        this.titleService.setTitle(count > 0 ? `(${count}) Lilia Paws Admin` : 'Lilia Paws Admin');
      });
  }
}
