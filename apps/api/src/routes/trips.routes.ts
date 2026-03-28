import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { requireAuth } from '../middleware/auth';
import {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
} from '../controllers/trips.controller';

const router = Router();

// Public — user-app reads trips
router.get('/', asyncHandler(async (req, res) => getTrips(req, res)));
router.get('/:id', asyncHandler(async (req, res) => getTripById(req, res)));

// Admin only
router.post('/', requireAuth, asyncHandler(async (req, res) => createTrip(req, res)));
router.put('/:id', requireAuth, asyncHandler(async (req, res) => updateTrip(req, res)));
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => deleteTrip(req, res)));

export default router;
