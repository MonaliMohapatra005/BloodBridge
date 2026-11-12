import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateDonorReadiness,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  registerSchema,
  loginSchema,
  readinessSchema,
} from '../validations/authValidation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/me', protect, getCurrentUser);
router.patch('/me/readiness', protect, validate(readinessSchema), updateDonorReadiness);

export default router;
