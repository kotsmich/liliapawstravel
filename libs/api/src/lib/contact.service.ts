import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ContactForm, ContactSubmission } from '@myorg/models';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly base = '/api/contact';

  constructor(private http: HttpClient) {}

  submitContact(form: ContactForm): Observable<ContactSubmission> {
    const submission: ContactSubmission = {
      ...form,
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
    };
    return of(submission).pipe(delay(700));
  }
}
