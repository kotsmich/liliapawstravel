import { Injectable } from '@angular/core';
import { BaseWebSocketService } from './base-websocket.service';

@Injectable({ providedIn: 'root' })
export class AppWebSocketService extends BaseWebSocketService {
  protected readonly path = '/ws/app';

  connect(): void {
    this.open();
  }
}
