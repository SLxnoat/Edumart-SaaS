import { Router } from 'express';
import {
  getOrderHistory,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderInvoice,
} from '../controllers/orderController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Order history (requires auth)
router.get('/', authenticate, getOrderHistory);
router.get('/history', authenticate, getOrderHistory);

// Single order details & invoice (optionalAuth allows guest lookup right after checkout)
router.get('/:id', optionalAuth, getOrderById);
router.get('/:id/invoice', optionalAuth, getOrderInvoice);

// Order status update (admin only checked in controller)
router.put('/:id/status', authenticate, updateOrderStatus);

// Order cancellation (requires auth)
router.delete('/:id', authenticate, cancelOrder);

export default router;
