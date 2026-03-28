import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { requireAuth } from '../middleware/auth';
import { login, me } from '../controllers/auth.controller';

const router = Router();

router.post('/login', asyncHandler(async (req, res) => login(req, res)));
router.get('/me', requireAuth, asyncHandler(async (req, res) => me(req, res)));

export default router;
