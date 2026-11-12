import express from 'express';
import {
  getRequestMessages,
  sendRequestMessage,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { chatMessageSchema } from '../validations/chatValidation.js';

const router = express.Router({ mergeParams: true });

router.get('/:id/messages', protect, getRequestMessages);
router.post('/:id/messages', protect, validate(chatMessageSchema), sendRequestMessage);

export default router;
