import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  mergeGuestCart,
} from '../controllers/cartController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Works for guests (x-session-id header) and logged-in users (Bearer token).
router.use(optionalAuth);
router.get('/', getCart);
router.post('/add', addToCart);
router.post('/merge', mergeGuestCart);
router.put('/item/:cartItemId', updateCartItem);
router.delete('/item/:cartItemId', removeFromCart);
router.delete('/clear', clearCart);
router.get('/summary', getCartSummary);

export default router;
