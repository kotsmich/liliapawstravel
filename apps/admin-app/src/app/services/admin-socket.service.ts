import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { filter, take } from 'rxjs';

import { selectIsAuthenticated } from '@admin/core/store/auth';
import { addRequestFromSocket, updateRequestStatusSuccess } from '@admin/features/requests/store';
import { addMessageFromSocket } from '@admin/features/messages/store';
import { increment } from '@admin/core/store/notifications';
import { AppWebSocketService } from '@ui/lib/websocket/app-websocket.service';
import { SocketEvent } from '@models/lib/socket-events.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { ContactSubmission } from '@models/lib/contact-form.model';

@Injectable({ providedIn: 'root' })
export class AdminSocketService {
  private readonly store = inject(Store);
  private readonly wsService = inject(AppWebSocketService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private initialized = false;

  init(): void {
    this.store
      .select(selectIsAuthenticated)
      .pipe(
        filter((auth) => auth && !this.initialized),
        take(1),
      )
      .subscribe(() => {
        this.initialized = true;
        this.wsService.connect();
        this.listenToEvents();
      });
  }

  private listenToEvents(): void {
    this.wsService
      .listen<TripRequest>(SocketEvent.REQUEST_NEW)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((request) => {
        this.store.dispatch(addRequestFromSocket({ request }));
        this.store.dispatch(increment({ notificationType: 'requests' }));
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
        this.store.dispatch(updateRequestStatusSuccess({ request }));
      });

    this.wsService
      .listen<ContactSubmission>(SocketEvent.MESSAGE_NEW)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => {
        this.store.dispatch(addMessageFromSocket({ message }));
        this.store.dispatch(increment({ notificationType: 'messages' }));
        this.messageService.add({
          severity: 'info',
          summary: 'New Message',
          detail: `Message from ${message.name}`,
          life: 5000,
        });
      });
  }
}
