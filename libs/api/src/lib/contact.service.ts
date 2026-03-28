import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactForm, ContactSubmission } from '@myorg/models';
import { API_URL } from './api-url.token';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private base = `${inject(API_URL)}/api/contact`;

  submitContact(form: ContactForm): Observable<ContactSubmission> {
    return this.http.post<ContactSubmission>(this.base, form);
  }
}
