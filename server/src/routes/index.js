import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'edumart-server',
  });
});

// API welcome endpoint
router.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the EduMart API',
    version: 'v1',
  });
});

export default router;
