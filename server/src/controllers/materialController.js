import Material from '../models/Material.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

/**
 * Get all materials with filtering, search, and pagination
 */
export const getMaterials = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      subject,
      gradeLevel,
      examYear,
      materialType,
      isFree,
      isPublished,
      isFeatured,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    
    // Build where clause
    const whereClause = {};
    
    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { shortDescription: { [Op.like]: `%${search}%` } },
      ];
    }
    
    // Filter by category
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    // Filter by subject
    if (subject) {
      whereClause.subject = subject;
    }
    
    // Filter by grade level
    if (gradeLevel) {
      whereClause.gradeLevel = gradeLevel;
    }
    
    // Filter by exam year
    if (examYear) {
      whereClause.examYear = parseInt(examYear);
    }
    
    // Filter by material type
    if (materialType) {
      whereClause.materialType = materialType;
    }
    
    // Filter by free/paid
    if (isFree !== undefined) {
      whereClause.isFree = isFree === 'true';
    }
    
    // Filter by published status
    if (isPublished !== undefined) {
      whereClause.isPublished = isPublished === 'true';
    }
    
    // Filter by featured status
    if (isFeatured !== undefined) {
      whereClause.isFeatured = isFeatured === 'true';
    }
    
    // Filter by price range
    if (minPrice !== undefined && minPrice !== '' || maxPrice !== undefined && maxPrice !== '') {
      whereClause.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        whereClause.price[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        whereClause.price[Op.lte] = parseFloat(maxPrice);
      }
    }
    
    // Validate sortBy field to prevent SQL injection
    const allowedSortFields = ['title', 'createdAt', 'updatedAt', 'viewCount', 'downloadCount', 'price'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'DESC';
    
    // Get materials with pagination
    const { count, rows: materials } = await Material.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        }
      ],
      offset,
      limit: limitNum,
      order: [[safeSortBy, safeSortOrder]],
    });
    
    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: parseInt(page),
      materials,
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get a single material by ID
 */
export const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const material = await Material.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        }
      ],
    });
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }
    
    // Increment view count
    await material.increment('viewCount');
    
    res.status(200).json({
      success: true,
      material,
    });
  } catch (error) {
    console.error('Get material by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch material',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Create a new material
 */
export const createMaterial = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      price,
      isFree,
      subject,
      gradeLevel,
      examYear,
      materialType,
      thumbnailUrl,
      previewImages,
      fileAttachments,
      isPublished,
      isFeatured,
      categoryId,
      createdBy
    } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Material title is required',
      });
    }
    
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category is required',
      });
    }
    
    if (!createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Creator is required',
      });
    }
    
    // Validate category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found',
      });
    }
    
    // Validate creator exists
    const creator = await User.findByPk(createdBy);
    if (!creator) {
      return res.status(400).json({
        success: false,
        message: 'Creator not found',
      });
    }
    
    // Set default values
    const finalPrice = isFree === true ? 0 : (price || 0);
    const finalPreviewImages = previewImages || [];
    const finalFileAttachments = fileAttachments || [];
    
    const material = await Material.create({
      title,
      description: description || '',
      shortDescription: shortDescription || '',
      price: finalPrice,
      isFree: isFree === true,
      subject: subject || null,
      gradeLevel: gradeLevel || null,
      examYear: examYear ? parseInt(examYear) : null,
      materialType: materialType || 'other',
      thumbnailUrl: thumbnailUrl || null,
      previewImages: finalPreviewImages,
      fileAttachments: finalFileAttachments,
      isPublished: isPublished === true,
      isFeatured: isFeatured === true,
      categoryId,
      createdBy,
    });
    
    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      material,
    });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create material',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update a material
 */
export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }
    
    // Validate category if being updated
    if (updateData.categoryId !== undefined) {
      const category = await Category.findByPk(updateData.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found',
        });
      }
    }
    
    // Validate creator if being updated
    if (updateData.createdBy !== undefined) {
      const creator = await User.findByPk(updateData.createdBy);
      if (!creator) {
        return res.status(400).json({
          success: false,
          message: 'Creator not found',
        });
      }
    }
    
    // Handle price/isFree logic
    if (updateData.isFree !== undefined && updateData.isFree === true) {
      updateData.price = 0;
    } else if (updateData.price !== undefined && updateData.price > 0) {
      updateData.isFree = false;
    }
    
    // Update material
    const updatedMaterial = await material.update(updateData);
    
    res.status(200).json({
      success: true,
      message: 'Material updated successfully',
      material: updatedMaterial,
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update material',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete a material
 */
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }
    
    await material.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Material deleted successfully',
    });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete material',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get featured materials
 */
export const getFeaturedMaterials = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const limitNum = parseInt(limit);
    
    const materials = await Material.findAll({
      where: {
        isPublished: true,
        isFeatured: true,
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName'],
        }
      ],
      limit: limitNum,
      order: [['createdAt', 'DESC']],
    });
    
    res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error('Get featured materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured materials',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get materials by category (with optional subcategories)
 */
export const getMaterialsByCategory = async (req, res) => {
  try {
    const { categoryId, includeSubcategories = false, limit = 20 } = req.query;
    const limitNum = parseInt(limit);
    
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required',
      });
    }
    
    let whereClause = {};
    
    if (includeSubcategories === 'true') {
      // Get all subcategory IDs recursively
      const getAllSubcategoryIds = async (parentId) => {
        const subcategories = await Category.findAll({
          where: { parentId },
          attributes: ['id'],
        });
        
        let ids = subcategories.map(subcat => subcat.id);
        
        // Recursively get subcategories of subcategories
        for (const subcat of subcategories) {
          const childIds = await getAllSubcategoryIds(subcat.id);
          ids = [...ids, ...childIds];
        }
        
        return ids;
      };
      
      const subcategoryIds = await getAllSubcategoryIds(categoryId);
      whereClause.categoryId = { [Op.in]: [...subcategoryIds, categoryId] };
    } else {
      whereClause.categoryId = categoryId;
    }
    
    whereClause.isPublished = true;
    
    const materials = await Material.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName'],
        }
      ],
      limit: limitNum,
      order: [['createdAt', 'DESC']],
    });
    
    res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error('Get materials by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export default {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getFeaturedMaterials,
  getMaterialsByCategory,
};

/**
 * Get search suggestions for auto-complete
 */
export const getSearchSuggestions = async (req, res) => {
  try {
    const { query = '' } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(200).json({
        success: true,
        suggestions: [],
      });
    }
    
    const searchTerm = query.trim();
    
    // Search in title and shortDescription for suggestions
    const materials = await Material.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${searchTerm}%` } },
          { shortDescription: { [Op.like]: `%${searchTerm}%` } },
        ],
        isPublished: true, // Only show published materials in suggestions
      },
      attributes: ['id', 'title', 'shortDescription'],
      limit: 10,
      order: [['title', 'ASC']],
    });
    
    const suggestions = materials.map(material => ({
      id: material.id,
      title: material.title,
      shortDescription: material.shortDescription,
    }));
    
    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
