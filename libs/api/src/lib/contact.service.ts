import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactForm, ContactSubmission } from '@myorg/models';
import { API_URL } from './api-url.token';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private base: string;

  constructor(
    private http: HttpClient,
    @Inject(API_URL) apiUrl: string,
  ) {
    this.base = `${apiUrl}/api/contact`;
  }

  submitContact(form: ContactForm): Observable<ContactSubmission> {
    return this.http.post<ContactSubmission>(this.base, form);
  }
}
