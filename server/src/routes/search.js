import { Router } from 'express';
import {
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  getSavedSearches,
  saveSearch,
  removeSavedSearch,
} from '../controllers/searchController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Search history routes
router.get('/history', authenticate, getSearchHistory);
router.post('/history', authenticate, addToSearchHistory);
router.delete('/history', authenticate, clearSearchHistory);

// Saved searches routes
router.get('/saved', authenticate, getSavedSearches);
router.post('/saved', authenticate, saveSearch);
router.delete('/saved/:id', authenticate, removeSavedSearch);

export default router;
