import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripRequest } from '@models/lib/trip-request.model';

@Injectable({ providedIn: 'root' })
export class TripRequestService {
  constructor(private http: HttpClient) {}

  submitRequest(request: Partial<TripRequest>): Observable<TripRequest> {
    return this.http.post<TripRequest>('/api/requests', request);
  }
}
