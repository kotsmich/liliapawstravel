import { Dog } from './dog.model';

export interface TripRequest {
  id: string;
  submittedAt: string;
  dogs: Dog[];
  status: 'pending' | 'approved' | 'rejected';
  tripId?: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  adminNote?: string | null;
}
