import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripResult } from '@models/lib/trip-result.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TripResultsService {
  private readonly baseUrl = `${environment.apiUrl}/trip-results`;

  private readonly http = inject(HttpClient);

  getTripResults(): Observable<TripResult[]> {
    return this.http.get<TripResult[]>(this.baseUrl);
  }

  getTripResultById(id: string): Observable<TripResult> {
    return this.http.get<TripResult>(`${this.baseUrl}/${id}`);
  }
}
