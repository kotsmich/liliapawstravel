import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dog } from '@models/lib/dog.model';
import { environment } from '../../environments/environment';

export interface DogDocument {
  id: string;
  type: string;
  verified: boolean;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class DogsService {
  private readonly baseUrl = `${environment.apiUrl}/dogs`;

  constructor(private http: HttpClient) {}

  createDog(tripId: string, dog: Partial<Dog>): Observable<Dog> {
    return this.http.post<Dog>(`${environment.apiUrl}/trips/${tripId}/dogs`, dog);
  }

  updateDog(id: string, dog: Partial<Dog>): Observable<Dog> {
    return this.http.put<Dog>(`${this.baseUrl}/${id}`, dog);
  }

  uploadDogPhoto(id: string, formData: FormData): Observable<{ photoUrl: string }> {
    return this.http.post<{ photoUrl: string }>(`${this.baseUrl}/${id}/photo`, formData);
  }

  verifyDocument(
    dogId: string,
    docId: string,
    data: Partial<DogDocument>,
  ): Observable<DogDocument> {
    return this.http.put<DogDocument>(`${this.baseUrl}/${dogId}/documents/${docId}`, data);
  }
}
