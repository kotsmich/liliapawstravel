import { TripStatus } from './trip.model';

export interface CalendarEvent {
  id: string;
  tripId: string;
  title: string;
  date: string;
  color: string;
  status?: TripStatus;
  dogsCount?: number;
  totalCapacity?: number;
  spotsAvailable?: number;
  isFull?: boolean;
  acceptingRequests?: boolean;
}
