// In-memory data store with seed data matching the Angular mocks.
// To move to a real database: replace each exported array with DB queries
// inside the relevant controller, keeping the same shapes.

import { Trip, TripRequest, ContactSubmission } from '../types';

export const trips: Trip[] = [
  {
    id: '1',
    date: '2026-04-12',
    departureCountry: 'Romania',
    departureCity: 'Bucharest',
    arrivalCountry: 'Netherlands',
    arrivalCity: 'Amsterdam',
    status: 'upcoming',
    spotsAvailable: 4,
    notes: 'Rescue dogs from Bucharest shelters.',
    dogs: [
      {
        id: 'd1',
        name: 'Buddy',
        size: 'medium',
        chipId: '123456789012345',
        fromCountry: 'Romania',
        fromCity: 'Bucharest',
        toCountry: 'Netherlands',
        toCity: 'Amsterdam',
        notes: '',
      },
    ],
  },
  {
    id: '2',
    date: '2026-04-26',
    departureCountry: 'Germany',
    departureCity: 'Berlin',
    arrivalCountry: 'Belgium',
    arrivalCity: 'Brussels',
    status: 'upcoming',
    spotsAvailable: 6,
    notes: 'Monthly Berlin shelter run.',
    dogs: [],
  },
  {
    id: '3',
    date: '2026-03-10',
    departureCountry: 'Spain',
    departureCity: 'Valencia',
    arrivalCountry: 'France',
    arrivalCity: 'Lyon',
    status: 'completed',
    spotsAvailable: 0,
    notes: 'Hunting dogs from Valencia.',
    dogs: [],
  },
];

export const tripRequests: TripRequest[] = [];

export const contactSubmissions: ContactSubmission[] = [];
