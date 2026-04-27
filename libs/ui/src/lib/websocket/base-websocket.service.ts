import { Injectable, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subject, EMPTY, filter, map } from 'rxjs';

export interface WsMessage<T = unknown> {
  event: string;
  data: T;
}

const RECONNECT_DELAY_MS = 3000;

@Injectable()
export abstract class BaseWebSocketService implements OnDestroy {
  protected readonly platformId = inject(PLATFORM_ID);
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  protected readonly messages$ = new Subject<WsMessage>();

  protected abstract readonly path: string;

  protected open(): void {
    if (!isPlatformBrowser(this.platformId) || this.socket) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.socket = new WebSocket(`${protocol}//${window.location.host}${this.path}`);

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as WsMessage;
        this.messages$.next(message);
      } catch { /* ignore malformed frames */ }
    };

    this.socket.onclose = () => {
      this.socket = null;
      if (!this.destroyed) {
        this.reconnectTimer = setTimeout(() => this.open(), RECONNECT_DELAY_MS);
      }
    };

    this.socket.onerror = () => this.socket?.close();
  }

  listen<T>(event: string): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) return EMPTY;
    return this.messages$.pipe(
      filter((message) => message.event === event),
      map((message) => message.data as T),
    );
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
  }
}
