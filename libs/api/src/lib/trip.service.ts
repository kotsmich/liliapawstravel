import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Trip } from '@myorg/models';

const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    date: '2026-04-12',
    departureCountry: 'Romania',
    departureCity: 'Bucharest',
    arrivalCountry: 'Netherlands',
    arrivalCity: 'Amsterdam',
    status: 'upcoming',
    notes: 'Rescue dogs from Bucharest shelters.',
    dogs: [
      { id: 'd1', name: 'Buddy', size: 'medium', chipId: '123456789012345', fromCountry: 'Romania', fromCity: 'Bucharest', toCountry: 'Netherlands', toCity: 'Amsterdam', notes: '' },
    ],
  },
  {
    id: '2',
    date: '2026-04-26',
    departureCountry: 'Germany',
    departureCity: 'Berlin',
    arrivalCountry: 'Belgium',
    arrivalCity: 'Brussels',
    status: 'upcoming',
    notes: 'Monthly Berlin shelter run.',
    dogs: [],
  },
  {
    id: '3',
    date: '2026-03-10',
    departureCountry: 'Spain',
    departureCity: 'Valencia',
    arrivalCountry: 'France',
    arrivalCity: 'Lyon',
    status: 'completed',
    notes: 'Hunting dogs from Valencia.',
    dogs: [],
  },
];

@Injectable({ providedIn: 'root' })
export class TripService {
  private readonly base = '/api/trips';

  constructor(private http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    // Mock: return of(MOCK_TRIPS).pipe(delay(500));
    return of([...MOCK_TRIPS]).pipe(delay(500));
  }

  getTripById(id: string): Observable<Trip> {
    const trip = MOCK_TRIPS.find((t) => t.id === id)!;
    return of({ ...trip }).pipe(delay(300));
  }

  addTrip(trip: Omit<Trip, 'id'>): Observable<Trip> {
    const saved: Trip = { ...trip, id: crypto.randomUUID() } as Trip;
    return of(saved).pipe(delay(600));
  }

  updateTrip(id: string, trip: Partial<Trip>): Observable<Trip> {
    const existing = MOCK_TRIPS.find((t) => t.id === id)!;
    const updated: Trip = { ...existing, ...trip, id };
    return of(updated).pipe(delay(600));
  }

  deleteTrip(id: string): Observable<{ id: string }> {
    return of({ id }).pipe(delay(400));
  }
}
