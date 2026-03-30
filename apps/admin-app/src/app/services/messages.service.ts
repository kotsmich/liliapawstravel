import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactSubmission } from '@models/lib/contact-form.model';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  constructor(private http: HttpClient) {}

  getMessages(): Observable<ContactSubmission[]> {
    return this.http.get<ContactSubmission[]>('/api/admin-portal/contact');
  }

  getMessageById(id: string): Observable<ContactSubmission> {
    return this.http.get<ContactSubmission>(`/api/admin-portal/contact/${id}`);
  }

  deleteMessage(id: string): Observable<{ id: string }> {
    return this.http.delete<{ id: string }>(`/api/admin-portal/contact/${id}`);
  }
}
