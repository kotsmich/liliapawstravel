import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripRequest } from '@models/lib/trip-request.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TripRequestService {
  private readonly baseUrl = `${environment.apiUrl}/requests`;

  private readonly http = inject(HttpClient);

  submitRequest(request: Record<string, unknown>): Observable<TripRequest> {
    return this.http.post<TripRequest>(this.baseUrl, request);
  }
}
