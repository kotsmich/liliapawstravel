import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip, Dog } from '@myorg/models';
import { API_URL } from './api-url.token';

@Injectable({ providedIn: 'root' })
export class TripService {
  private base: string;

  constructor(
    private http: HttpClient,
    @Inject(API_URL) apiUrl: string,
  ) {
    this.base = `${apiUrl}/api/trips`;
  }

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

  updateDog(tripId: string, dog: Dog): Observable<Dog> {
    return this.http.patch<Dog>(`${this.base}/${tripId}/dogs/${dog.id}`, dog);
  }

  deleteTrip(id: string): Observable<{ id: string }> {
    return this.http.delete<{ id: string }>(`${this.base}/${id}`);
  }
}
