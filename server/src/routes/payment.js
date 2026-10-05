import { Router } from 'express';
import { createPaymentIntent, handleWebhook } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/payment/create-intent
router.post('/create-intent', createPaymentIntent);

// POST /api/payment/webhook
// Note: We do not use authentication here because the webhook comes from Stripe.
// We rely on the Stripe signature verification in the controller.
router.post('/webhook', handleWebhook);

export default router;
