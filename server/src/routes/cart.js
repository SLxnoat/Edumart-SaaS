import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes (for guest carts, we rely on sessionId in header/body)
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:cartItemId', updateCartItem);
router.delete('/item/:cartItemId', removeFromCart);
router.delete('/clear', clearCart);
router.get('/summary', getCartSummary);

// Protected routes (for user carts, require authentication)
// Note: The same endpoints work for both guest and user carts because
// the controller checks for userId (from auth) or sessionId (from header/body)
// So we don't need separate protected routes for cart operations.
// However, if we want to enforce authentication for certain operations, we can.
// For now, we leave all cart routes public but dependent on context (user or session).

export default router;
