import { Router } from 'express';
import {
  guestCheckout,
  userCheckout,
} from '../controllers/checkoutController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Guest checkout (does not require authentication, but requires sessionId)
router.post('/guest', guestCheckout);

// User checkout (requires authentication)
router.post('/user', authenticate, userCheckout);

export default router;
