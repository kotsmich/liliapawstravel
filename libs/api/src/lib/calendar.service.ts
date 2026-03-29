import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarEvent } from '@myorg/models';
import { API_URL } from './api-url.token';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private base: string;

  constructor(
    private http: HttpClient,
    @Inject(API_URL) apiUrl: string,
  ) {
    this.base = `${apiUrl}/api/calendar`;
  }

  getEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(this.base);
  }
}
