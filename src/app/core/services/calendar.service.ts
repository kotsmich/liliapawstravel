import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CalendarEvent } from '../../models';

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Germany → Netherlands Transport',
    date: '2026-04-12',
    fromCountry: 'Germany',
    toCountry: 'Netherlands',
    spotsAvailable: 4,
    description: 'Monthly run from Berlin shelters to Amsterdam foster homes.',
  },
  {
    id: '2',
    title: 'Romania → Belgium Transport',
    date: '2026-04-26',
    fromCountry: 'Romania',
    toCountry: 'Belgium',
    spotsAvailable: 6,
    description: 'Rescue dogs from Bucharest traveling to approved adopters in Brussels.',
  },
  {
    id: '3',
    title: 'Spain → France Transport',
    date: '2026-05-10',
    fromCountry: 'Spain',
    toCountry: 'France',
    spotsAvailable: 3,
    description: 'Special run for hunting dogs rescued from Valencia heading to Lyon.',
  },
  {
    id: '4',
    title: 'Hungary → Austria Transport',
    date: '2026-05-24',
    fromCountry: 'Hungary',
    toCountry: 'Austria',
    spotsAvailable: 5,
    description: 'Budapest shelter dogs traveling to Vienna adoption centers.',
  },
];

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly apiUrl = `${environment.apiBaseUrl}/calendar`;

  constructor(private http: HttpClient) {}

  getEvents(): Observable<CalendarEvent[]> {
    // Mocked: swap for this.http.get<CalendarEvent[]>(this.apiUrl) when backend ready
    return of(MOCK_EVENTS).pipe(delay(600));
  }
}
