import { Router } from 'express';
import authRoutes from './auth.js';
import categoryRoutes from './categories.js';
import materialRoutes from './materials.js';
// Import other route files as they are created
// import cartRoutes from './cart.js';
// import orderRoutes from './orders.js';
// etc.

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'edumart-server',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/materials', materialRoutes);
// Other API routes will be added here as they are created
// router.use('/api/cart', cartRoutes);
// router.use('/api/orders', orderRoutes);
// etc.

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
      // Other endpoints will be added as they are implemented
      // '/api/cart',
      // '/api/orders',
      // '/api/payments',
      // '/api/admin',
      // '/api/chatbot',
    ],
  });
});

export default router;
