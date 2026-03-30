import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dog } from '@models/lib/dog.model';

export interface DogDocument {
  id: string;
  type: string;
  verified: boolean;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class DogsService {
  constructor(private http: HttpClient) {}

  updateDog(id: string, dog: Partial<Dog>): Observable<Dog> {
    return this.http.put<Dog>(`/api/dogs/${id}`, dog);
  }

  uploadDogPhoto(id: string, formData: FormData): Observable<{ photoUrl: string }> {
    return this.http.post<{ photoUrl: string }>(`/api/dogs/${id}/photo`, formData);
  }

  verifyDocument(
    dogId: string,
    docId: string,
    data: Partial<DogDocument>,
  ): Observable<DogDocument> {
    return this.http.put<DogDocument>(`/api/dogs/${dogId}/documents/${docId}`, data);
  }
}
