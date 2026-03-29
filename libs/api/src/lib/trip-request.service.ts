import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripRequest, Trip } from '@myorg/models';
import { API_URL } from './api-url.token';

@Injectable({ providedIn: 'root' })
export class TripRequestService {
  private base: string;

  constructor(
    private http: HttpClient,
    @Inject(API_URL) apiUrl: string,
  ) {
    this.base = `${apiUrl}/api/requests`;
  }

  submitRequest(
    dogs: TripRequest['dogs'],
    tripId: string | undefined,
    requesterName: string,
    requesterEmail: string,
    requesterPhone: string,
  ): Observable<TripRequest> {
    return this.http.post<TripRequest>(this.base, { tripId, requesterName, requesterEmail, requesterPhone, dogs });
  }

  getRequests(): Observable<TripRequest[]> {
    return this.http.get<TripRequest[]>(this.base);
  }

  updateStatus(id: string, status: TripRequest['status']): Observable<TripRequest> {
    return this.http.patch<TripRequest>(`${this.base}/${id}/status`, { status });
  }

  approveRequest(id: string): Observable<{ request: TripRequest; trip: Trip }> {
    return this.http.post<{ request: TripRequest; trip: Trip }>(`${this.base}/${id}/approve`, {});
  }

  deleteRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
