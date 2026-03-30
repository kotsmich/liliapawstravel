import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '@models/lib/trip.model';

@Injectable({ providedIn: 'root' })
export class TripsService {
  constructor(private http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>('/api/trips');
  }

  getTripById(id: string): Observable<Trip> {
    return this.http.get<Trip>(`/api/trips/${id}`);
  }

  createTrip(trip: Partial<Trip>): Observable<Trip> {
    return this.http.post<Trip>('/api/trips', trip);
  }

  updateTrip(id: string, trip: Partial<Trip>): Observable<Trip> {
    return this.http.put<Trip>(`/api/trips/${id}`, trip);
  }

  deleteTrip(id: string): Observable<{ id: string }> {
    return this.http.delete<{ id: string }>(`/api/trips/${id}`);
  }
}
