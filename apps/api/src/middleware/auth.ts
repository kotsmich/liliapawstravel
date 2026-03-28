import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error';

export interface AuthPayload {
  sub: string;
  email: string;
}

// Extends Express Request so controllers can access req.user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'No token provided'));
  }

  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, process.env['JWT_SECRET']!) as AuthPayload;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}
