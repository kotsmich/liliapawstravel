import { Dog } from './dog.model';

export interface TripRequest {
  id: string;
  submittedAt: string;
  dogs: Dog[];
  status: 'pending' | 'confirmed' | 'completed';
  tripId?: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
}
