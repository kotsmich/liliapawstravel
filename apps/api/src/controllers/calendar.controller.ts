import { Request, Response } from 'express';
import { trips } from '../data/store';
import { CalendarEvent } from '../types';

// Calendar events are derived from upcoming/in-progress trips — no separate table needed.
export function getCalendarEvents(_req: Request, res: Response) {
  const events: CalendarEvent[] = trips
    .filter((t) => t.status !== 'completed')
    .map((t) => ({
      id: `evt-${t.id}`,
      tripId: t.id,
      title: `${t.departureCity} → ${t.arrivalCity}`,
      date: t.date,
      color: t.status === 'in-progress' ? '#e07b54' : '#4caf50',
    }));

  res.json(events);
}
