import { Router } from 'express';
import {
  validateCoupon,
  createOrderFromCheckout,
  guestCheckout,
  userCheckout,
} from '../controllers/checkoutController.js';
import { optionalAuth, authenticate } from '../middleware/auth.js';

const router = Router();

// Validate coupon preview
router.post('/validate-coupon', optionalAuth, validateCoupon);

// Checkout endpoints
router.post('/', optionalAuth, createOrderFromCheckout);
router.post('/guest', optionalAuth, guestCheckout);
router.post('/user', authenticate, userCheckout);

export default router;
