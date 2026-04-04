import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '@models/lib/trip.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TripsService {
  private readonly baseUrl = `${environment.apiUrl}/trips`;

  private readonly http = inject(HttpClient);

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.baseUrl);
  }

  getTripById(id: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.baseUrl}/${id}`);
  }
}
