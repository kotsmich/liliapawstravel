import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactForm, ContactSubmission } from '@models/lib/contact-form.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private http: HttpClient) {}

  submitContact(form: ContactForm): Observable<ContactSubmission> {
    return this.http.post<ContactSubmission>('/api/contact', form);
  }
}
