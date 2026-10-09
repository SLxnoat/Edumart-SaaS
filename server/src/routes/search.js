import { Router } from 'express';
import {
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  getSavedSearches,
  saveSearch,
  removeSavedSearch,
} from '../controllers/searchController.js';
import { listProducts } from '../controllers/catalogController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Product search with filters: GET /api/search?q=&subject=&grade=&examYear=&format=&minPrice=&maxPrice=&sort=
router.get('/', listProducts);

// Search history routes
router.get('/history', authenticate, getSearchHistory);
router.post('/history', authenticate, addToSearchHistory);
router.delete('/history', authenticate, clearSearchHistory);

// Saved searches routes
router.get('/saved', authenticate, getSavedSearches);
router.post('/saved', authenticate, saveSearch);
router.delete('/saved/:id', authenticate, removeSavedSearch);

export default router;
