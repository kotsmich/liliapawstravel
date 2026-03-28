import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { getCalendarEvents } from '../controllers/calendar.controller';

const router = Router();

// Public — user-app calendar reads this
router.get('/', asyncHandler(async (req, res) => getCalendarEvents(req, res)));

export default router;
