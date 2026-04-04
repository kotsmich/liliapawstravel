import { Injectable, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EMPTY } from 'rxjs';
import { Observable, Subject } from 'rxjs';
import { Trip } from '@models/lib/trip.model';

const RECONNECT_DELAY_MS = 3000;

@Injectable({ providedIn: 'root' })
export class TripsWebSocketService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly trips$ = new Subject<Trip[]>();
  private destroyed = false;

  connect(): Observable<Trip[]> {
    if (!isPlatformBrowser(this.platformId)) return EMPTY;
    if (!this.ws) this.open();
    return this.trips$.asObservable();
  }

  private get wsUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws/trips`;
  }

  private open(): void {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as { event: string; data: Trip[] };
        if (msg.event === 'trips') this.trips$.next(msg.data);
      } catch { /* ignore malformed frames */ }
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
