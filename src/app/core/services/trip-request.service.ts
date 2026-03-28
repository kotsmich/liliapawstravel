import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TripRequest, TripRequestSubmission } from '../../models';

@Injectable({ providedIn: 'root' })
export class TripRequestService {
  private readonly apiUrl = `${environment.apiBaseUrl}/trip-requests`;

  constructor(private http: HttpClient) {}

  submitRequest(request: TripRequest): Observable<TripRequestSubmission> {
    // Mocked: swap for this.http.post<TripRequestSubmission>(this.apiUrl, request) when backend ready
    const submission: TripRequestSubmission = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      dogs: request.dogs,
      status: 'pending',
    };
    return of(submission).pipe(delay(800));
  }
}
