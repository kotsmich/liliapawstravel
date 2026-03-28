import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripRequest } from '@myorg/models';
import { API_URL } from './api-url.token';

@Injectable({ providedIn: 'root' })
export class TripRequestService {
  private http = inject(HttpClient);
  private base = `${inject(API_URL)}/api/trip-requests`;

  submitRequest(dogs: TripRequest['dogs'], tripId?: string): Observable<TripRequest> {
    return this.http.post<TripRequest>(this.base, { tripId, dogs });
  }
}
