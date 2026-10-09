import { Op, fn, col, where as sqlWhere } from 'sequelize';
import sequelize from '../config/db.js';

const { Material, Category, User } = sequelize.models;

const NEW_DAYS = 30;

// UI format labels <-> DB (format / product_type)
const formatLabel = (m) => {
  if (m.format === 'physical') return 'Print';
  if (m.productType === 'ebook') return 'ePub';
  if (m.productType === 'lecture_pack') return 'Video';
  return 'PDF';
};

const formatCondition = (label) => {
  switch (label) {
    case 'Print': return { format: 'physical' };
    case 'ePub': return { productType: 'ebook', format: { [Op.ne]: 'physical' } };
    case 'Video': return { productType: 'lecture_pack', format: { [Op.ne]: 'physical' } };
    case 'PDF': return { productType: { [Op.notIn]: ['ebook', 'lecture_pack'] }, format: { [Op.ne]: 'physical' } };
    default: return null;
  }
};

export const toProduct = (m) => {
  const price = Number(m.price);
  const originalPrice = m.originalPrice != null ? Number(m.originalPrice) : null;
  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;
  const createdAt = m.createdAt ? new Date(m.createdAt) : null;
  return {
    id: m.id,
    name: m.title,
    price,
    originalPrice,
    discount,
    rating: Number(m.ratingAverage) || 0,
    reviewCount: m.ratingCount || 0,
    thumbnail: m.thumbnailUrl || null,
    isNew: createdAt ? Date.now() - createdAt.getTime() < NEW_DAYS * 86400000 : false,
    isFeatured: !!m.isFeatured,
    subject: m.subject,
    grade: m.gradeLevel,
    examYear: m.examYear != null ? String(m.examYear) : '',
    format: formatLabel(m),
    category: m.category ? { id: m.category.id, name: m.category.name } : undefined,
    createdAt: m.createdAt,
  };
};

const include = [{ model: Category, as: 'category', attributes: ['id', 'name'] }];
const visible = { isActive: true, isApproved: true };

const sortOrder = (sort) => {
  switch (sort) {
    case 'price-low': return [['price', 'ASC']];
    case 'price-high': return [['price', 'DESC']];
    case 'rating': return [['ratingAverage', 'DESC'], ['ratingCount', 'DESC']];
    case 'newest': return [['createdAt', 'DESC']];
    case 'featured': return [['isFeatured', 'DESC'], ['ratingAverage', 'DESC']];
    default: return [['isFeatured', 'DESC'], ['viewCount', 'DESC'], ['createdAt', 'DESC']]; // relevance
  }
};

// Accepts numeric id or (case-insensitive) category name
const resolveCategory = async (idOrName) => {
  if (idOrName === undefined || idOrName === '') return null;
  if (/^\d+$/.test(String(idOrName))) return Category.findByPk(Number(idOrName));
  return Category.findOne({ where: sqlWhere(fn('LOWER', col('name')), String(idOrName).toLowerCase()) });
};

const buildWhere = async (q) => {
  const where = { ...visible };
  const and = [];
  const term = (q.q || q.search || '').trim();
  if (term) {
    const like = { [Op.like]: `%${term}%` };
    and.push({ [Op.or]: [{ title: like }, { description: like }, { shortDescription: like }, { subject: like }] });
  }
  if (q.categoryId) {
    const category = await resolveCategory(q.categoryId);
    if (!category) return null;
    where.categoryId = category.id;
  }
  if (q.subject) where.subject = q.subject;
  if (q.grade || q.gradeLevel) where.gradeLevel = q.grade || q.gradeLevel;
  if (q.examYear) where.examYear = parseInt(q.examYear, 10);
  const fc = q.format ? formatCondition(q.format) : null;
  if (fc) and.push(fc);
  const price = {};
  if (q.minPrice !== undefined && q.minPrice !== '' && !Number.isNaN(parseFloat(q.minPrice))) price[Op.gte] = parseFloat(q.minPrice);
  if (q.maxPrice !== undefined && q.maxPrice !== '' && !Number.isNaN(parseFloat(q.maxPrice))) price[Op.lte] = parseFloat(q.maxPrice);
  if (Reflect.ownKeys(price).length) where.price = price;
  if (and.length) where[Op.and] = and;
  return where;
};

/** GET /api/materials and GET /api/search — filtered, sorted, paginated listing */
export const listProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 100);
    const where = await buildWhere(req.query);
    if (!where) return res.status(200).json({ success: true, count: 0, totalPages: 0, currentPage: page, products: [] });

    const { count, rows } = await Material.findAndCountAll({
      where,
      include,
      order: sortOrder(req.query.sort || req.query.sortBy),
      offset: (page - 1) * limit,
      limit,
    });
    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      products: rows.map(toProduct),
    });
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

/** GET /api/materials/featured */
export const getFeatured = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 50);
    const rows = await Material.findAll({
      where: { ...visible, isFeatured: true },
      include,
      order: [['ratingAverage', 'DESC']],
      limit,
    });
    res.json({ success: true, products: rows.map(toProduct) });
  } catch (error) {
    console.error('Featured error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch featured products' });
  }
};

/** GET /api/materials/suggest?q= */
export const suggest = async (req, res) => {
  try {
    const term = (req.query.q || '').trim();
    if (term.length < 2) return res.json({ success: true, suggestions: [] });
    const rows = await Material.findAll({
      where: { ...visible, title: { [Op.like]: `%${term}%` } },
      attributes: ['id', 'title'],
      limit: 8,
    });
    res.json({ success: true, suggestions: rows.map((r) => ({ id: r.id, name: r.title })) });
  } catch (error) {
    console.error('Suggest error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suggestions' });
  }
};

/** GET /api/materials/:id */
export const getProduct = async (req, res) => {
  try {
    const m = await Material.findOne({
      where: { id: req.params.id, ...visible },
      include: [...include, { model: User, as: 'seller', attributes: ['firstName', 'lastName'] }],
    });
    if (!m) return res.status(404).json({ success: false, message: 'Product not found' });
    await m.increment('viewCount');

    const [reviewRows] = await sequelize.query(
      `SELECT r.id, r.rating, r.title, r.comment, r.created_at AS createdAt,
              CONCAT(u.first_name, ' ', u.last_name) AS userName
         FROM reviews r JOIN users u ON u.id = r.user_id
        WHERE r.product_id = :id AND r.is_approved = 1
        ORDER BY r.created_at DESC LIMIT 50`,
      { replacements: { id: m.id } },
    );

    const base = toProduct(m);
    res.json({
      success: true,
      product: {
        ...base,
        description: m.description,
        shortDescription: m.shortDescription || '',
        images: m.thumbnailUrl ? [m.thumbnailUrl] : [],
        category: m.category?.name || '',
        categoryId: m.categoryId,
        gradeLevel: m.gradeLevel,
        isDigital: m.format !== 'physical',
        isPhysical: m.format !== 'digital',
        stock: m.stockQuantity,
        sku: m.sku || '',
        vendor: m.seller ? `${m.seller.firstName} ${m.seller.lastName}` : '',
        reviews: reviewRows.map((r) => ({ ...r, images: [], isHelpful: false, helpfulCount: 0 })),
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

/** GET /api/materials/:id/related — same category first, then same subject */
export const getRelated = async (req, res) => {
  try {
    const m = await Material.findByPk(req.params.id);
    if (!m) return res.status(404).json({ success: false, message: 'Product not found' });
    const limit = Math.min(parseInt(req.query.limit, 10) || 4, 12);
    const rows = await Material.findAll({
      where: {
        ...visible,
        id: { [Op.ne]: m.id },
        [Op.or]: [{ categoryId: m.categoryId }, { subject: m.subject }],
      },
      include,
      order: [['ratingAverage', 'DESC'], ['viewCount', 'DESC']],
      limit,
    });
    res.json({ success: true, products: rows.map(toProduct) });
  } catch (error) {
    console.error('Related error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch related products' });
  }
};

/** GET /api/categories/browse — active categories with product counts */
export const browseCategories = async (req, res) => {
  try {
    const cats = await Category.findAll({ where: { isActive: true }, order: [['sortOrder', 'ASC'], ['name', 'ASC']] });
    const [counts] = await sequelize.query(
      'SELECT category_id AS id, COUNT(*) AS n FROM products WHERE is_active = 1 AND is_approved = 1 GROUP BY category_id',
    );
    const map = new Map(counts.map((c) => [c.id, Number(c.n)]));
    res.json({
      success: true,
      categories: cats.map((c) => ({ id: c.id, name: c.name, description: c.description, parentId: c.parentId, productCount: map.get(c.id) || 0 })),
    });
  } catch (error) {
    console.error('Browse categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

/** GET /api/categories/:idOrName/products */
export const getCategoryWithProducts = async (req, res) => {
  try {
    const category = await resolveCategory(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    req.query.categoryId = String(category.id);
    const where = await buildWhere(req.query);
    const rows = await Material.findAll({ where, include, order: sortOrder(req.query.sort) });
    res.json({
      success: true,
      category: { id: category.id, name: category.name, description: category.description },
      products: rows.map(toProduct),
    });
  } catch (error) {
    console.error('Category products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category products' });
  }
};
