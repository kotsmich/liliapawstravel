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

  createDogs(tripId: string, dogs: Partial<Dog>[]): Observable<Dog[]> {
    return this.http.post<Dog[]>(`${environment.apiUrl}/trips/${tripId}/dogs/bulk`, { dogs });
  }

  updateDog(id: string, dog: Partial<Dog>): Observable<Dog> {
    const { id: _id, ...body } = dog as Dog;
    return this.http.put<Dog>(`${this.baseUrl}/${id}`, body);
  }

  deleteDog(id: string): Observable<{ id: string }> {
    return this.http.delete<{ id: string }>(`${this.baseUrl}/${id}`);
  }

  deleteDogs(ids: string[]): Observable<{ deleted: string[] }> {
    return this.http.delete<{ deleted: string[] }>(`${this.baseUrl}/bulk`, { body: { ids } });
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
