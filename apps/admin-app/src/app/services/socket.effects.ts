import { inject, Injectable } from '@angular/core';
import { createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, EMPTY, filter, map, mergeMap, take, tap } from 'rxjs';

import { selectIsAuthenticated } from '@admin/core/store/auth';
import { addRequestFromSocket, requestUpdatedFromSocket } from '@admin/features/requests/store';
import { addMessageFromSocket } from '@admin/features/messages/store';
import { increment } from '@admin/core/store/notifications';
import { AppWebSocketService } from '@ui/lib/websocket/app-websocket.service';
import { SocketEvent } from '@models/lib/socket-events.model';
import { TripRequest } from '@models/lib/trip-request.model';
import { ContactSubmission } from '@models/lib/contact-form.model';

@Injectable()
export class SocketEffects {
  private readonly store = inject(Store);
  private readonly wsService = inject(AppWebSocketService);

  connectOnAuth$ = createEffect(
    () =>
      this.store.select(selectIsAuthenticated).pipe(
        filter(Boolean),
        take(1),
        tap(() => this.wsService.connect()),
      ),
    { dispatch: false },
  );

  requestNew$ = createEffect(() =>
    this.wsService.listen<TripRequest>(SocketEvent.REQUEST_NEW).pipe(
      catchError((err) => { console.error('WS REQUEST_NEW error', err); return EMPTY; }),
      mergeMap((request) => [
        addRequestFromSocket({ request }),
        increment({ notificationType: 'requests' }),
      ]),
    )
  );

  requestUpdated$ = createEffect(() =>
    this.wsService.listen<TripRequest>(SocketEvent.REQUEST_UPDATED).pipe(
      catchError((err) => { console.error('WS REQUEST_UPDATED error', err); return EMPTY; }),
      map((request) => requestUpdatedFromSocket({ request })),
    )
  );

  messageNew$ = createEffect(() =>
    this.wsService.listen<ContactSubmission>(SocketEvent.MESSAGE_NEW).pipe(
      catchError((err) => { console.error('WS MESSAGE_NEW error', err); return EMPTY; }),
      mergeMap((message) => [
        addMessageFromSocket({ message }),
        increment({ notificationType: 'messages' }),
      ]),
    )
  );
}
