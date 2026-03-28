import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TripRequest } from '@myorg/models';

@Injectable({ providedIn: 'root' })
export class TripRequestService {
  private readonly base = '/api/trip-requests';

  constructor(private http: HttpClient) {}

  submitRequest(dogs: TripRequest['dogs']): Observable<TripRequest> {
    const result: TripRequest = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      dogs,
      status: 'pending',
    };
    return of(result).pipe(delay(800));
  }
}
