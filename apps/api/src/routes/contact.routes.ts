import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { requireAuth } from '../middleware/auth';
import { getContactSubmissions, submitContact } from '../controllers/contact.controller';

const router = Router();

// Public — user submits contact form
router.post('/', asyncHandler(async (req, res) => submitContact(req, res)));

// Admin only
router.get('/', requireAuth, asyncHandler(async (req, res) => getContactSubmissions(req, res)));

export default router;
