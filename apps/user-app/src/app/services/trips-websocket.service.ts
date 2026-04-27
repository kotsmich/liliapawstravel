import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Trip } from '@models/lib/trip.model';
import { BaseWebSocketService } from '@ui/lib/websocket/base-websocket.service';

@Injectable({ providedIn: 'root' })
export class TripsWebSocketService extends BaseWebSocketService implements OnDestroy {
  protected readonly path = '/ws/trips';

  connect(): Observable<Trip[]> {
    this.open();
    return this.listen<Trip[]>('trips');
  }
}
