import SearchHistory from '../models/SearchHistory.js';
import SavedSearch from '../models/SavedSearch.js';
import User from '../models/User.js';

/**
 * Get search history for the authenticated user
 */
export const getSearchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const history = await SearchHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50, // Limit to last 50 searches
    });
    
    res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Add a search to the history for the authenticated user
 */
export const addToSearchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }
    
    // Create a new search history entry
    await SearchHistory.create({
      userId,
      query: query.trim(),
    });
    
    res.status(200).json({
      success: true,
      message: 'Search added to history',
    });
  } catch (error) {
    console.error('Add to search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add search to history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Clear search history for the authenticated user
 */
export const clearSearchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await SearchHistory.destroy({
      where: { userId },
    });
    
    res.status(200).json({
      success: true,
      message: 'Search history cleared',
    });
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear search history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get saved searches for the authenticated user
 */
export const getSavedSearches = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const savedSearches = await SavedSearch.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    
    res.status(200).json({
      success: true,
      savedSearches,
    });
  } catch (error) {
    console.error('Get saved searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved searches',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Save a search for the authenticated user
 */
export const saveSearch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, name } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search name is required',
      });
    }
    
    // Check if a saved search with the same name already exists for this user
    const existing = await SavedSearch.findOne({
      where: {
        userId,
        name: name.trim(),
      },
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A saved search with this name already exists',
      });
    }
    
    // Create a new saved search
    await SavedSearch.create({
      userId,
      query: query.trim(),
      name: name.trim(),
    });
    
    res.status(200).json({
      success: true,
      message: 'Search saved successfully',
    });
  } catch (error) {
    console.error('Save search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save search',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Remove a saved search for the authenticated user
 */
export const removeSavedSearch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const deleted = await SavedSearch.destroy({
      where: {
        id,
        userId,
      },
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Saved search not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Saved search removed',
    });
  } catch (error) {
    console.error('Remove saved search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove saved search',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export default {
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  getSavedSearches,
  saveSearch,
  removeSavedSearch,
};
