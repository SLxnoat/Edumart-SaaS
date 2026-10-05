import { Router } from 'express';
import {
  getOrderHistory,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderInvoice,
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.get('/history', authenticate, getOrderHistory);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, updateOrderStatus);
router.delete('/:id', authenticate, cancelOrder);
router.get('/:id/invoice', authenticate, getOrderInvoice);

export default router;
