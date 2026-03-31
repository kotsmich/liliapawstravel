import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '@models/lib/trip.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TripsService {
  private readonly baseUrl = `${environment.apiUrl}/trips`;

  constructor(private http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.baseUrl);
  }

  getTripById(id: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.baseUrl}/${id}`);
  }

  createTrip(trip: Partial<Trip>): Observable<Trip> {
    return this.http.post<Trip>(this.baseUrl, trip);
  }

  updateTrip(id: string, trip: Partial<Trip>): Observable<Trip> {
    return this.http.put<Trip>(`${this.baseUrl}/${id}`, trip);
  }

  deleteTrip(id: string): Observable<{ id: string }> {
    return this.http.delete<{ id: string }>(`${this.baseUrl}/${id}`);
  }
}
