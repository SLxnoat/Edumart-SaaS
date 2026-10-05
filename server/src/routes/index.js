import { Router } from 'express';
import authRoutes from './auth.js';
// Import other route files as they are created
// import productRoutes from './products.js';
// import cartRoutes from './cart.js';
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
// Other API routes will be added here as they are created
// router.use('/api/products', productRoutes);
// router.use('/api/cart', cartRoutes);
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
      // Other endpoints will be added as they are implemented
      // '/api/products',
      // '/api/cart',
      // '/api/orders',
      // '/api/payments',
      // '/api/admin',
      // '/api/chatbot',
    ],
  });
});

export default router;
