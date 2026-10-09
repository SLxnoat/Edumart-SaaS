import { Router } from 'express';
import {
  getSellerDashboard,
  getSellerProducts,
  createSellerProduct,
  toggleProductStatus,
  deleteSellerProduct,
  getSellerOrders,
  getSellerEarnings,
  requestPayout,
  getSellerAnalytics,
} from '../controllers/sellerController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All seller endpoints require authentication
router.use(authenticate);

router.get('/dashboard', getSellerDashboard);
router.get('/products', getSellerProducts);
router.post('/products', createSellerProduct);
router.put('/products/:id/toggle-status', toggleProductStatus);
router.delete('/products/:id', deleteSellerProduct);

router.get('/orders', getSellerOrders);
router.get('/earnings', getSellerEarnings);
router.post('/payout', requestPayout);
router.get('/analytics', getSellerAnalytics);

export default router;
