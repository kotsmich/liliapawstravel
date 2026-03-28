import { Dog } from './dog.model';

export interface TripRequest {
  id?: string;
  submittedAt?: string;
  dogs: Dog[];
  status?: 'pending' | 'confirmed' | 'completed';
}

export interface TripRequestSubmission {
  id: string;
  submittedAt: string;
  dogs: Dog[];
  status: 'pending' | 'confirmed' | 'completed';
}
