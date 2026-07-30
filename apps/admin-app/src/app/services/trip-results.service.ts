import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripResult, TripResultPayload } from '@models/lib/trip-result.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TripResultsService {
  private readonly baseUrl = `${environment.apiUrl}/trip-results`;

  private readonly http = inject(HttpClient);

  getTripResults(): Observable<TripResult[]> {
    return this.http.get<TripResult[]>(this.baseUrl);
  }

  createTripResult(payload: TripResultPayload): Observable<TripResult> {
    return this.http.post<TripResult>(this.baseUrl, payload);
  }

  updateTripResult(id: string, payload: TripResultPayload): Observable<TripResult> {
    return this.http.put<TripResult>(`${this.baseUrl}/${id}`, payload);
  }

  deleteTripResult(id: string): Observable<{ id: string }> {
    return this.http.delete<{ id: string }>(`${this.baseUrl}/${id}`);
  }

  uploadPhotos(id: string, files: File[]): Observable<TripResult> {
    const formData = new FormData();
    files.forEach((file) => formData.append('photos', file));
    return this.http.post<TripResult>(`${this.baseUrl}/${id}/photos`, formData);
  }

  deletePhoto(id: string, photoId: string): Observable<TripResult> {
    return this.http.delete<TripResult>(`${this.baseUrl}/${id}/photos/${photoId}`);
  }
}
