import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AppError } from '../middleware/error';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const adminEmail = process.env['ADMIN_EMAIL'];
  const adminPassword = process.env['ADMIN_PASSWORD'];

  if (email !== adminEmail || password !== adminPassword) {
    throw new AppError(401, 'Invalid credentials');
  }

  const token = jwt.sign(
    { sub: 'admin', email },
    process.env['JWT_SECRET']!,
    { expiresIn: '8h' }
  );

  res.json({ token });
}

export function me(req: Request, res: Response) {
  res.json({ email: req.user!.email });
}
