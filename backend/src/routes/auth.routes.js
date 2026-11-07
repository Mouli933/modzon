import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { currentUser, login, logout, signup } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginSchema, signupSchema } from '../validators/auth.validator.js';

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many signup attempts. Please try again later.' },
});

router.post('/signup', signupLimiter, validate(signupSchema), asyncHandler(signup));
router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(login));
router.post('/logout', logout);
router.get('/me', requireAuth, asyncHandler(currentUser));

export default router;
