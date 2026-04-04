import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactSubmission } from '@models/lib/contact-form.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly baseUrl = `${environment.apiUrl}/admin-portal/contact`;

  private readonly http = inject(HttpClient);

  getMessages(): Observable<ContactSubmission[]> {
    return this.http.get<ContactSubmission[]>(this.baseUrl);
  }

  getMessageById(id: string): Observable<ContactSubmission> {
    return this.http.get<ContactSubmission>(`${this.baseUrl}/${id}`);
  }

  deleteMessage(id: string): Observable<{ id: string }> {
    return this.http.delete<{ id: string }>(`${this.baseUrl}/${id}`);
  }
}
