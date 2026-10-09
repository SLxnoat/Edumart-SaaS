import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  toggleUserVerification,
  deleteUser,
  impersonateUser,
  getModerationQueue,
  approveProduct,
  rejectProduct,
  bulkModerateProducts,
  getAdminOrders,
  getAdminOrderDetail,
  updateAdminOrderStatus,
  processOrderRefund,
  exportAdminOrders,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(admin);

// GET /api/admin/stats
router.get('/stats', getDashboardStats);

// User Management Routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-verify', toggleUserVerification);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/impersonate', impersonateUser);

// Product Moderation Queue Routes
router.get('/moderation', getModerationQueue);
router.put('/moderation/:id/approve', approveProduct);
router.put('/moderation/:id/reject', rejectProduct);
router.post('/moderation/bulk', bulkModerateProducts);

// Order Management Routes
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderDetail);
router.put('/orders/:id/status', updateAdminOrderStatus);
router.post('/orders/:id/refund', processOrderRefund);
router.post('/orders/export', exportAdminOrders);

export default router;
