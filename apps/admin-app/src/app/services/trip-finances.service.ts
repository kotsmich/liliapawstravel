import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TripFinanceEntry,
  TripFinanceEntryChanges,
  TripFinanceEntryPayload,
} from '@models/lib/trip-finance.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TripFinancesService {
  private readonly http = inject(HttpClient);

  private url(tripId: string): string {
    return `${environment.apiUrl}/trips/${tripId}/finances`;
  }

  getEntries(tripId: string): Observable<TripFinanceEntry[]> {
    return this.http.get<TripFinanceEntry[]>(this.url(tripId));
  }

  createEntry(tripId: string, payload: TripFinanceEntryPayload): Observable<TripFinanceEntry> {
    return this.http.post<TripFinanceEntry>(this.url(tripId), payload);
  }

  updateEntry(
    tripId: string,
    entryId: string,
    changes: TripFinanceEntryChanges
  ): Observable<TripFinanceEntry> {
    return this.http.put<TripFinanceEntry>(`${this.url(tripId)}/${entryId}`, changes);
  }

  deleteEntry(tripId: string, entryId: string): Observable<{ id: string }> {
    return this.http.delete<{ id: string }>(`${this.url(tripId)}/${entryId}`);
  }
}
