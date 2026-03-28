// Mirrors the Angular @myorg/models interfaces.
// Keep in sync if the models change.

export type DogSize = 'small' | 'medium' | 'large';

export interface Dog {
  id: string;
  name: string;
  size: DogSize;
  chipId: string;
  fromCountry: string;
  fromCity: string;
  toCountry: string;
  toCity: string;
  notes: string;
}

export type TripStatus = 'upcoming' | 'in-progress' | 'completed';

export interface Trip {
  id: string;
  date: string; // YYYY-MM-DD
  departureCountry: string;
  departureCity: string;
  arrivalCountry: string;
  arrivalCity: string;
  status: TripStatus;
  spotsAvailable: number;
  notes: string;
  dogs: Dog[];
}

export type TripRequestStatus = 'pending' | 'confirmed' | 'completed';

export interface TripRequest {
  id: string;
  tripId: string;
  dogs: Dog[];
  status: TripRequestStatus;
  submittedAt: string; // ISO timestamp
}

export interface CalendarEvent {
  id: string;
  tripId: string;
  title: string;
  date: string; // YYYY-MM-DD
  color: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submittedAt: string; // ISO timestamp
}
