import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorMiddleware } from './middleware/error';
import authRoutes from './routes/auth.routes';
import tripsRoutes from './routes/trips.routes';
import calendarRoutes from './routes/calendar.routes';
import tripRequestsRoutes from './routes/trip-requests.routes';
import contactRoutes from './routes/contact.routes';

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: ['http://localhost:4200', 'http://localhost:4201'] }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/trip-requests', tripRequestsRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Must be last — handles all thrown errors
app.use(errorMiddleware);

export default app;
