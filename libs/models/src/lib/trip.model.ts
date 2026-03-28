import { Dog } from './dog.model';

export type TripStatus = 'upcoming' | 'in-progress' | 'completed';

export interface Trip {
  id: string;
  date: string;
  departureCountry: string;
  departureCity: string;
  arrivalCountry: string;
  arrivalCity: string;
  status: TripStatus;
  spotsAvailable?: number;
  notes: string;
  dogs: Dog[];
}
