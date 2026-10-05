import { Router } from 'express';
import {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getFeaturedMaterials,
  getMaterialsByCategory,
  getSearchSuggestions,
} from '../controllers/materialController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getMaterials);
router.get('/featured', getFeaturedMaterials);
router.get('/category/:categoryId', getMaterialsByCategory);
router.get('/:id', getMaterialById);
router.get('/suggest', getSearchSuggestions);

// Protected routes (require authentication)
router.post('/', authenticate, createMaterial);
router.put('/:id', authenticate, updateMaterial);
router.delete('/:id', authenticate, deleteMaterial);

export default router;
