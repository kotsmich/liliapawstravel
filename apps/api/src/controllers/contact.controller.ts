import { Request, Response } from 'express';
import { z } from 'zod';
import { contactSubmissions } from '../data/store';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().default(''),
  subject: z.string().min(1),
  message: z.string().min(10),
});

export function getContactSubmissions(_req: Request, res: Response) {
  res.json(contactSubmissions);
}

export function submitContact(req: Request, res: Response) {
  const body = contactSchema.parse(req.body);
  const submission = {
    ...body,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  };
  contactSubmissions.push(submission);
  res.status(201).json(submission);
}
