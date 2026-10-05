import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'edumart-server',
    timestamp: new Date().toISOString(),
  });
});

router.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the EduMart API',
    version: 'v1',
    endpoints: [
      '/api/auth',
      '/api/products',
      '/api/cart',
      '/api/orders',
      '/api/payments',
      '/api/admin',
      '/api/chatbot',
    ],
  });
});

export default router;
