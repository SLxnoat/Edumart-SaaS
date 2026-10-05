import Category from '../models/Category.js';
import Material from '../models/Material.js';

/**
 * Get all categories (with optional filtering)
 */
export const getCategories = async (req, res) => {
  try {
    const { parentId, includeSubcategories = false } = req.query;
    
    const whereClause = {};
    if (parentId !== undefined && parentId !== null) {
      whereClause.parentId = parentId === 'null' ? null : parentId;
    } else if (parentId === null) {
      // Explicitly looking for top-level categories
      whereClause.parentId = null;
    }
    
    const categories = await Category.findAll({
      where: whereClause,
      include: includeSubcategories === 'true' ? [{
        model: Category,
        as: 'subcategories',
        where: { isActive: true },
        required: false,
      }] : undefined,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByPk(id, {
      include: [{
        model: Category,
        as: 'subcategories',
        where: { isActive: true },
        required: false,
      }],
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    
    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Create a new category
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, parentId, level, sortOrder } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }
    
    // Validate parentId if provided
    if (parentId) {
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found',
        });
      }
    }
    
    // Determine level if not provided
    const finalLevel = level !== undefined ? level : 
                      (parentId ? await Category.findByPk(parentId).then(cat => cat.level + 1) : 0);
    
    const category = await Category.create({
      name,
      description: description || '',
      parentId: parentId || null,
      level: finalLevel,
      sortOrder: sortOrder || 0,
    });
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update a category
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentId, isActive, sortOrder } = req.body;
    
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    
    // Validate parentId if provided and different from current
    if (parentId !== undefined && parentId !== null && parentId !== category.parentId) {
      if (parentId === id) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent',
        });
      }
      
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found',
        });
      }
      
      // Check for circular reference
      const checkCircular = async (categoryId, potentialParentId) => {
        if (!potentialParentId) return false;
        const parent = await Category.findByPk(potentialParentId);
        if (!parent) return false;
        if (parent.id === categoryId) return true;
        return checkCircular(categoryId, parent.parentId);
      };
      
      const isCircular = await checkCircular(id, parentId);
      if (isCircular) {
        return res.status(400).json({
          success: false,
          message: 'Circular reference detected',
        });
      }
    }
    
    // Update category
    const updatedCategory = await category.update({
      name: name !== undefined ? name : category.name,
      description: description !== undefined ? description : category.description,
      parentId: parentId !== undefined ? parentId : category.parentId,
      isActive: isActive !== undefined ? isActive : category.isActive,
      sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
    });
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    
    // Check if category has subcategories
    const subcategoryCount = await Category.count({
      where: { parentId: id },
    });
    
    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories. Please delete or reassign subcategories first.',
      });
    }
    
    // Check if category has materials
    const materialCount = await Material.count({
      where: { categoryId: id },
    });
    
    if (materialCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with materials. Please move or delete materials first.',
      });
    }
    
    await category.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get category tree structure
 */
export const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });
    
    // Build tree structure
    const buildTree = (categories, parentId = null) => {
      return categories
        .filter(category => category.parentId === parentId)
        .map(category => ({
          ...category.toJSON(),
          subcategories: buildTree(categories, category.id),
        }));
    };
    
    const tree = buildTree(categories);
    
    res.status(200).json({
      success: true,
      categoryTree: tree,
    });
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category tree',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
};
