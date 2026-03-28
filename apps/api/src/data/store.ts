// In-memory data store with seed data matching the Angular mocks.
// To move to a real database: replace each exported array with DB queries
// inside the relevant controller, keeping the same shapes.

import { Trip, TripRequest, ContactSubmission } from '../types';

export const trips: Trip[] = [];

export const tripRequests: TripRequest[] = [];

export const contactSubmissions: ContactSubmission[] = [];
