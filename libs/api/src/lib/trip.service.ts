import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '@myorg/models';
import { API_URL } from './api-url.token';

@Injectable({ providedIn: 'root' })
export class TripService {
  private http = inject(HttpClient);
  private base = `${inject(API_URL)}/api/trips`;

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.base);
  }

  getTripById(id: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.base}/${id}`);
  }

  addTrip(trip: Omit<Trip, 'id'>): Observable<Trip> {
    return this.http.post<Trip>(this.base, trip);
  }

  updateTrip(id: string, trip: Partial<Trip>): Observable<Trip> {
    return this.http.put<Trip>(`${this.base}/${id}`, trip);
  }

  deleteTrip(id: string): Observable<{ id: string }> {
    return this.http.delete<{ id: string }>(`${this.base}/${id}`);
  }
}
