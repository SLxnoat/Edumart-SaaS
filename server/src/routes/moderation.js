import { Router } from 'express';
import {
  getPendingMaterials,
  approveMaterial,
  rejectMaterial,
} from '../controllers/moderationController.js';
import { authenticate } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = Router();

// All moderation routes require authentication and admin role
router.use(authenticate);
router.use(admin);

// GET /api/materials/pending
router.get('/pending', getPendingMaterials);

// POST /api/materials/:id/approve
router.post('/:id/approve', approveMaterial);

// POST /api/materials/:id/reject
router.post('/:id/reject', rejectMaterial);

export default router;
