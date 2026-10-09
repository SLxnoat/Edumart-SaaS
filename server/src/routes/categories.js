import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
} from '../controllers/categoryController.js';
import { browseCategories, getCategoryWithProducts } from '../controllers/catalogController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/browse', browseCategories);
router.get('/:id/products', getCategoryWithProducts);
router.get('/:id', getCategoryById);

// Protected routes (require authentication)
router.post('/', authenticate, createCategory);
router.put('/:id', authenticate, updateCategory);
router.delete('/:id', authenticate, deleteCategory);

export default router;
