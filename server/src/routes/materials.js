import { Router } from 'express';
import {
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../controllers/materialController.js';
import {
  listProducts,
  getFeatured,
  suggest,
  getProduct,
  getRelated,
  getCategoryWithProducts,
} from '../controllers/catalogController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
// NOTE: fixed paths must be registered before '/:id'
router.get('/', listProducts);
router.get('/featured', getFeatured);
router.get('/suggest', suggest);
router.get('/category/:id', getCategoryWithProducts);
router.get('/:id/related', getRelated);
router.get('/:id', getProduct);

// Protected routes (require authentication)
router.post('/', authenticate, createMaterial);
router.put('/:id', authenticate, updateMaterial);
router.delete('/:id', authenticate, deleteMaterial);

export default router;
