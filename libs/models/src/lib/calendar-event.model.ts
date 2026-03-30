export interface CalendarEvent {
  id: string;
  tripId: string;
  title: string;
  date: string;
  color: string;
  dogsCount?: number;
  totalCapacity?: number;
  isFull?: boolean;
  acceptingRequests?: boolean;
}
