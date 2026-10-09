import { Router } from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  verifyPaymentIntent,
  handleWebhook,
} from '../controllers/paymentController.js';
import { optionalAuth, authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/create-intent', optionalAuth, createPaymentIntent);
router.post('/confirm', optionalAuth, confirmPayment);
router.post('/refund/:orderId', authenticate, refundPayment);
router.get('/verify/:paymentIntentId', verifyPaymentIntent);
router.post('/webhook', handleWebhook);

export default router;
