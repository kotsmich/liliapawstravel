import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactForm, ContactSubmission } from '@models/lib/contact-form.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly baseUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) {}

  submitContact(form: ContactForm): Observable<ContactSubmission> {
    return this.http.post<ContactSubmission>(this.baseUrl, form);
  }
}
