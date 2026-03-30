import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripRequest } from '@models/lib/trip-request.model';
import { Trip } from '@models/lib/trip.model';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  constructor(private http: HttpClient) {}

  getRequests(): Observable<TripRequest[]> {
    return this.http.get<TripRequest[]>('/api/requests');
  }

  getRequestById(id: string): Observable<TripRequest> {
    return this.http.get<TripRequest>(`/api/requests/${id}`);
  }

  approveRequest(id: string): Observable<{ request: TripRequest; trip: Trip }> {
    return this.http.post<{ request: TripRequest; trip: Trip }>(`/api/requests/${id}/approve`, {});
  }

  updateRequestStatus(
    id: string,
    status: 'rejected',
  ): Observable<TripRequest> {
    return this.http.patch<TripRequest>(`/api/requests/${id}/status`, { status });
  }

  deleteRequest(id: string): Observable<void> {
    return this.http.delete<void>(`/api/requests/${id}`);
  }
}
