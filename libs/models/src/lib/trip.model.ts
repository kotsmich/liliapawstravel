import { Dog } from './dog.model';

export type TripStatus = 'upcoming' | 'in-progress' | 'completed';

export interface TripRequester {
  requestId: string | null;
  name: string;
  dogs: Dog[];
}

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
  requester?: TripRequester[];
  isFull: boolean;
  acceptingRequests: boolean;
}
