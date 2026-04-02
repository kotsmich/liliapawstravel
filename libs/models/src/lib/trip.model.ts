import { Dog } from './dog.model';
import { TripRequest } from './trip-request.model';

export type TripStatus = 'upcoming' | 'in-progress' | 'completed';

export interface Trip {
  id: string;
  date: string;
  departureCountry: string;
  departureCity: string;
  arrivalCountry: string;
  arrivalCity: string;
  status: TripStatus;
  totalCapacity: number;
  spotsAvailable: number;
  notes: string;
  dogs: Dog[] | undefined;
  requests?: TripRequest[];
  isFull: boolean;
  acceptingRequests: boolean;
}
