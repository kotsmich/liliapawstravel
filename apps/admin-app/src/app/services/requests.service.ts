import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripRequest } from '@models/lib/trip-request.model';
import { Trip } from '@models/lib/trip.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private readonly baseUrl = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) {}

  getRequests(): Observable<TripRequest[]> {
    return this.http.get<TripRequest[]>(this.baseUrl);
  }

  getRequestById(id: string): Observable<TripRequest> {
    return this.http.get<TripRequest>(`${this.baseUrl}/${id}`);
  }

  approveRequest(id: string): Observable<{ request: TripRequest; trip: Trip }> {
    return this.http.post<{ request: TripRequest; trip: Trip }>(`${this.baseUrl}/${id}/approve`, {});
  }

  updateRequestStatus(
    id: string,
    status: 'rejected',
  ): Observable<TripRequest> {
    return this.http.patch<TripRequest>(`${this.baseUrl}/${id}/status`, { status });
  }

  deleteRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  updateRequestNote(id: string, note: string): Observable<TripRequest> {
    return this.http.patch<TripRequest>(`${this.baseUrl}/${id}/note`, { note });
  }

  bulkApproveRequests(ids: string[]): Observable<{ succeeded: string[]; failed: Array<{ id: string; reason: string }> }> {
    return this.http.post<{ succeeded: string[]; failed: Array<{ id: string; reason: string }> }>(`${this.baseUrl}/bulk-approve`, { ids });
  }

  bulkRejectRequests(ids: string[]): Observable<{ succeeded: string[]; failed: Array<{ id: string; reason: string }> }> {
    return this.http.post<{ succeeded: string[]; failed: Array<{ id: string; reason: string }> }>(`${this.baseUrl}/bulk-reject`, { ids });
  }
}
