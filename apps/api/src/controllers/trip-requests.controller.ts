import { Request, Response } from 'express';
import { z } from 'zod';
import { tripRequests, trips } from '../data/store';
import { AppError } from '../middleware/error';

const dogSchema = z.object({
  name: z.string().min(1),
  size: z.enum(['small', 'medium', 'large']),
  age: z.number().int().min(0),
  chipId: z.string().regex(/^\d{15}$/),
  pickupLocation: z.string().min(1),
  dropLocation: z.string().min(1),
  notes: z.string().default(''),
});

const submitSchema = z.object({
  tripId: z.string().min(1),
  requesterName: z.string().min(1),
  requesterEmail: z.string().email(),
  requesterPhone: z.string().min(1),
  dogs: z.array(dogSchema).min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed']),
});

export function getTripRequests(_req: Request, res: Response) {
  res.json(tripRequests);
}

export function submitTripRequest(req: Request, res: Response) {
  const { tripId, requesterName, requesterEmail, requesterPhone, dogs } = submitSchema.parse(req.body);

  const trip = trips.find((t) => t.id === tripId);
  if (!trip) throw new AppError(404, 'Trip not found');

  // Check raw capacity (not spotsAvailable) so we don't reject before approval
  const pendingForTrip = tripRequests
    .filter((r) => r.tripId === tripId && r.status === 'pending')
    .reduce((sum, r) => sum + r.dogs.length, 0);
  const confirmedForTrip = trip.dogs.length;
  const totalRequested = confirmedForTrip + pendingForTrip + dogs.length;

  if (totalRequested > trip.totalCapacity) {
    throw new AppError(409, `This trip has no remaining capacity (${trip.totalCapacity} total)`);
  }

  const request = {
    id: crypto.randomUUID(),
    tripId,
    requesterName,
    requesterEmail,
    requesterPhone,
    dogs: dogs.map((d) => ({ ...d, id: crypto.randomUUID() })),
    status: 'pending' as const,
    submittedAt: new Date().toISOString(),
  };
  tripRequests.push(request);
  res.status(201).json(request);
}

export function updateTripRequestStatus(req: Request, res: Response) {
  const index = tripRequests.findIndex((r) => r.id === req.params['id']);
  if (index === -1) throw new AppError(404, 'Trip request not found');

  const { status } = updateStatusSchema.parse(req.body);
  tripRequests[index] = { ...tripRequests[index], status };
  const updated = tripRequests[index];

  // On approval: add the request dogs to the trip and recalculate spotsAvailable
  if (status === 'confirmed') {
    const trip = trips.find((t) => t.id === updated.tripId);
    if (trip) {
      trip.dogs = [
        ...trip.dogs,
        ...updated.dogs.map((d) => ({ ...d, id: d.id ?? crypto.randomUUID() })),
      ];
      trip.spotsAvailable = Math.max(0, trip.totalCapacity - trip.dogs.length);
    }
  }

  res.json(updated);
}
