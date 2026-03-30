import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, filter, map } from 'rxjs';
import { SocketEvent } from '@models/lib/socket-events.model';

interface WsMessage {
  event: SocketEvent;
  data: unknown;
}

const RECONNECT_DELAY_MS = 3000;

@Injectable({ providedIn: 'root' })
export class AppWebSocketService implements OnDestroy {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly messages$ = new Subject<WsMessage>();
  private destroyed = false;

  connect(): void {
    if (!this.ws) this.open();
  }

  listen<T>(event: SocketEvent): Observable<T> {
    return this.messages$.pipe(
      filter((msg) => msg.event === event),
      map((msg) => msg.data as T),
    );
  }

  private get wsUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws/app`;
  }

  private open(): void {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as WsMessage;
        this.messages$.next(msg);
      } catch {
        /* ignore malformed frames */
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (!this.destroyed) {
        this.reconnectTimer = setTimeout(() => this.open(), RECONNECT_DELAY_MS);
      }
    };

    this.ws.onerror = () => this.ws?.close();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}
