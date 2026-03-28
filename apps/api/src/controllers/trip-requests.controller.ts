import { Request, Response } from 'express';
import { z } from 'zod';
import { tripRequests, trips } from '../data/store';
import { AppError } from '../middleware/error';

const dogSchema = z.object({
  name: z.string().min(1),
  size: z.enum(['small', 'medium', 'large']),
  chipId: z.string().regex(/^\d{15}$/),
  fromCountry: z.string().min(1),
  fromCity: z.string().min(1),
  toCountry: z.string().min(1),
  toCity: z.string().min(1),
  notes: z.string().default(''),
});

const submitSchema = z.object({
  tripId: z.string().min(1),
  dogs: z.array(dogSchema).min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed']),
});

export function getTripRequests(_req: Request, res: Response) {
  res.json(tripRequests);
}

export function submitTripRequest(req: Request, res: Response) {
  const { tripId, dogs } = submitSchema.parse(req.body);

  const trip = trips.find((t) => t.id === tripId);
  if (!trip) throw new AppError(404, 'Trip not found');
  if (trip.spotsAvailable < dogs.length) {
    throw new AppError(409, `Only ${trip.spotsAvailable} spot(s) available`);
  }

  // Reserve spots
  trip.spotsAvailable -= dogs.length;

  const request = {
    id: crypto.randomUUID(),
    tripId,
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
  res.json(tripRequests[index]);
}
