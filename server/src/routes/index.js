import { Router } from 'express';
import authRoutes from './auth.js';
import categoryRoutes from './categories.js';
import materialRoutes from './materials.js';
import searchRoutes from './search.js';
import cartRoutes from './cart.js';
import checkoutRoutes from './checkout.js';
import paymentRoutes from './payment.js';
import orderRoutes from './orders.js';
import adminRoutes from './admin.js';
import moderationRoutes from './moderation.js';
import wishlistRoutes from './wishlist.js';
import chatbotRoutes from './chatbot.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'edumart-server',
  });
});

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/materials', materialRoutes);
router.use('/api/materials', moderationRoutes); // Moderation endpoints under same base
router.use('/api/search', searchRoutes);
router.use('/api/cart', cartRoutes);
router.use('/api/checkout', checkoutRoutes);
router.use('/api/payment', paymentRoutes);
router.use('/api/orders', orderRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/wishlist', wishlistRoutes);
router.use('/api/chatbot', chatbotRoutes);

// Root API endpoint
router.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the EduMart API',
    version: 'v1',
    endpoints: [
      '/api/auth/register',
      '/api/auth/verify/:token',
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/forgot-password',
      '/api/auth/reset-password/:token',
      '/api/auth/profile (protected)',
      '/api/auth/profile (protected, PUT)',
      '/api/categories',
      '/api/categories/tree',
      '/api/categories/:id',
      '/api/materials',
      '/api/materials/featured',
      '/api/materials/category/:categoryId',
      '/api/materials/:id',
      '/api/materials/suggest',
      '/api/materials/:id/related',
      '/api/search',
      '/api/wishlist (protected)',
      '/api/categories/browse',
      '/api/categories/:idOrName/products',
      '/api/materials/pending',
      '/api/materials/:id/approve',
      '/api/materials/:id/reject',
      '/api/cart',
      '/api/cart/add',
      '/api/cart/item/:cartItemId',
      '/api/cart/clear',
      '/api/cart/summary',
      '/api/checkout/guest',
      '/api/checkout/user',
      '/api/payment/create-intent',
      '/api/payment/refund/:orderId',
      '/api/payment/verify/:paymentIntentId',
      '/api/payment/webhook',
      '/api/orders/history',
      '/api/orders/:id',
      '/api/orders/:id/status',
      '/api/orders/:id',
      '/api/orders/:id/invoice',
      '/api/admin/stats',
      '/api/admin/users',
      '/api/search/history',
      '/api/search/history',
      '/api/search/saved',
      '/api/search/saved/:id',
      '/api/chatbot/message',
      '/api/chatbot/history/:sessionId',
      '/api/chatbot/feedback/:id',
      // Other endpoints will be added as they are implemented
      // '/api/payments',
    ],
  });
});

export default router;
