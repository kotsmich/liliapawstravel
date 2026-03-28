import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ContactForm, ContactSubmission } from '../../models';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly apiUrl = `${environment.apiBaseUrl}/contact`;

  constructor(private http: HttpClient) {}

  submitContact(form: ContactForm): Observable<ContactSubmission> {
    // Mocked: swap for this.http.post<ContactSubmission>(this.apiUrl, form) when backend ready
    const submission: ContactSubmission = {
      ...form,
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
    };
    return of(submission).pipe(delay(700));
  }
}
