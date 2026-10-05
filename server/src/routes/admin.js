import { Router } from 'express';
import { getDashboardStats, getAllUsers } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(admin);

// GET /api/admin/stats
router.get('/stats', getDashboardStats);

// GET /api/admin/users
router.get('/users', getAllUsers);

// Additional admin routes can be added here

export default router;
