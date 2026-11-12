import express from 'express';
import {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  respondToRequest,
  updateResponderStatus,
  updateRequestStatus,
} from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createRequestSchema,
  respondSchema,
  responderStatusSchema,
  requestStatusSchema,
} from '../validations/requestValidation.js';

const router = express.Router();

router.post('/', protect, validate(createRequestSchema), createBloodRequest);
router.get('/', protect, getBloodRequests);
router.get('/:id', protect, getBloodRequestById);
router.post('/:id/respond', protect, validate(respondSchema), respondToRequest);
router.patch('/:id/respond/status', protect, validate(responderStatusSchema), updateResponderStatus);
router.patch('/:id/status', protect, validate(requestStatusSchema), updateRequestStatus);

export default router;
