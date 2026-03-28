import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { requireAuth } from '../middleware/auth';
import {
  getTripRequests,
  submitTripRequest,
  updateTripRequestStatus,
} from '../controllers/trip-requests.controller';

const router = Router();

// Public — user submits a request
router.post('/', asyncHandler(async (req, res) => submitTripRequest(req, res)));

// Admin only
router.get('/', requireAuth, asyncHandler(async (req, res) => getTripRequests(req, res)));
router.patch('/:id/status', requireAuth, asyncHandler(async (req, res) => updateTripRequestStatus(req, res)));

export default router;
