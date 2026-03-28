import { Request, Response } from 'express';
import { z } from 'zod';
import { trips } from '../data/store';
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

const tripBodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departureCountry: z.string().min(1),
  departureCity: z.string().min(1),
  arrivalCountry: z.string().min(1),
  arrivalCity: z.string().min(1),
  status: z.enum(['upcoming', 'in-progress', 'completed']),
  spotsAvailable: z.number().int().min(0).default(0),
  notes: z.string().default(''),
  dogs: z.array(dogSchema).default([]),
});

export function getTrips(_req: Request, res: Response) {
  res.json(trips);
}

export function getTripById(req: Request, res: Response) {
  const trip = trips.find((t) => t.id === req.params['id']);
  if (!trip) throw new AppError(404, 'Trip not found');
  res.json(trip);
}

export function createTrip(req: Request, res: Response) {
  const body = tripBodySchema.parse(req.body);
  const trip = {
    ...body,
    id: crypto.randomUUID(),
    dogs: body.dogs.map((d) => ({ ...d, id: crypto.randomUUID() })),
  };
  trips.push(trip);
  res.status(201).json(trip);
}

export function updateTrip(req: Request, res: Response) {
  const index = trips.findIndex((t) => t.id === req.params['id']);
  if (index === -1) throw new AppError(404, 'Trip not found');

  const body = tripBodySchema.parse(req.body);
  const updated = {
    ...body,
    id: trips[index].id,
    dogs: body.dogs.map((d) => ({ ...d, id: crypto.randomUUID() })),
  };
  trips[index] = updated;
  res.json(updated);
}

export function deleteTrip(req: Request, res: Response) {
  const index = trips.findIndex((t) => t.id === req.params['id']);
  if (index === -1) throw new AppError(404, 'Trip not found');
  trips.splice(index, 1);
  res.json({ id: req.params['id'] });
}
