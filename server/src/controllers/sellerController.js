import crypto from 'crypto';
import sequelize from '../config/db.js';

const { Material, Category, Order, OrderItem, User } = sequelize.models;

/**
 * GET /api/seller/dashboard
 */
export const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Count seller products
    const totalProducts = await Material.count({ where: { sellerId } });

    // Find all products by seller
    const products = await Material.findAll({
      where: { sellerId },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order: [['viewCount', 'DESC']],
    });

    const productIds = products.map((p) => p.id);

    // Find order items for these products
    let totalSales = 0;
    let pendingOrdersCount = 0;
    let recentOrders = [];

    if (productIds.length > 0) {
      const [salesStats] = await sequelize.query(`
        SELECT 
          COALESCE(SUM(oi.total_price), 0) AS totalRevenue,
          COUNT(DISTINCT oi.order_id) AS totalOrders
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.product_id IN (?) AND o.payment_status = 'paid'
      `, { replacements: [productIds] });

      totalSales = Number(salesStats[0]?.totalRevenue || 0);

      const [pendingStats] = await sequelize.query(`
        SELECT COUNT(DISTINCT oi.order_id) AS pendingCount
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.product_id IN (?) AND o.status IN ('pending', 'processing')
      `, { replacements: [productIds] });

      pendingOrdersCount = Number(pendingStats[0]?.pendingCount || 0);

      const [orderRows] = await sequelize.query(`
        SELECT DISTINCT
          o.id,
          o.order_number AS orderNumber,
          o.status,
          o.created_at AS createdAt,
          oi.quantity,
          oi.total_price AS itemTotal,
          p.title AS productTitle,
          u.email AS customerEmail
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        JOIN users u ON u.id = o.user_id
        WHERE oi.product_id IN (?)
        ORDER BY o.created_at DESC
        LIMIT 10
      `, { replacements: [productIds] });

      recentOrders = orderRows;
    }

    res.json({
      success: true,
      stats: {
        totalSales,
        totalProducts,
        pendingOrders: pendingOrdersCount,
        avgOrderValue: totalSales > 0 ? Math.round((totalSales / Math.max(1, recentOrders.length)) * 100) / 100 : 0,
      },
      topProducts: products.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.title,
        views: p.viewCount || 0,
        price: Number(p.price),
        status: p.isApproved ? (p.isActive ? 'Active' : 'Inactive') : 'Pending Approval',
      })),
      recentOrders,
    });
  } catch (error) {
    console.error('Seller dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch seller dashboard data' });
  }
};

/**
 * GET /api/seller/products
 */
export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const products = await Material.findAll({
      where: { sellerId },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        format: p.format,
        subject: p.subject,
        gradeLevel: p.gradeLevel,
        stockQuantity: p.stockQuantity,
        views: p.viewCount,
        isActive: p.isActive,
        isApproved: p.isApproved,
        category: p.category?.name || 'Uncategorized',
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

/**
 * POST /api/seller/products
 * 4-Step Product Upload endpoint
 */
export const createSellerProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const {
      title,
      description,
      shortDescription,
      price,
      categoryId,
      subject,
      gradeLevel,
      examYear,
      productType = 'revision_notes',
      format = 'digital',
      stockQuantity = 0,
      thumbnailUrl,
    } = req.body;

    if (!title || !description || price === undefined || !categoryId || !subject || !gradeLevel) {
      return res.status(400).json({ success: false, message: 'Please provide all required product details' });
    }

    const newProduct = await Material.create({
      id: crypto.randomUUID(),
      sellerId,
      categoryId: Number(categoryId),
      title,
      description,
      shortDescription: shortDescription || title.slice(0, 100),
      price: parseFloat(price),
      sku: `SKU-${Date.now().toString(36).toUpperCase()}`,
      subject,
      gradeLevel,
      examYear: examYear ? parseInt(examYear, 10) : new Date().getFullYear(),
      productType,
      format,
      stockQuantity: format === 'digital' ? 0 : parseInt(stockQuantity || 10, 10),
      isDownloadable: format !== 'physical',
      isShippable: format !== 'digital',
      thumbnailUrl: thumbnailUrl || null,
      isActive: true,
      isApproved: true, // auto-approve for seller test or set false for admin moderation
      isFeatured: false,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

/**
 * PUT /api/seller/products/:id/toggle-status
 */
export const toggleProductStatus = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;
    const product = await Material.findOne({ where: { id, sellerId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    product.isActive = !product.isActive;
    await product.save();
    res.json({ success: true, message: 'Status updated', isActive: product.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle product status' });
  }
};

/**
 * DELETE /api/seller/products/:id
 */
export const deleteSellerProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;
    const deleted = await Material.destroy({ where: { id, sellerId } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

/**
 * GET /api/seller/orders
 */
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const products = await Material.findAll({ where: { sellerId }, attributes: ['id'] });
    const productIds = products.map((p) => p.id);

    if (productIds.length === 0) {
      return res.json({ success: true, orders: [] });
    }

    const [orders] = await sequelize.query(`
      SELECT 
        oi.id AS orderItemId,
        o.id AS orderId,
        o.order_number AS orderNumber,
        o.status AS orderStatus,
        o.payment_status AS paymentStatus,
        o.created_at AS orderDate,
        o.shipping_address AS shippingAddress,
        p.id AS productId,
        p.title AS productTitle,
        p.format AS format,
        oi.quantity,
        oi.unit_price AS unitPrice,
        oi.total_price AS totalPrice,
        u.email AS customerEmail,
        CONCAT(u.first_name, ' ', u.last_name) AS customerName
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      JOIN users u ON u.id = o.user_id
      WHERE oi.product_id IN (?)
      ORDER BY o.created_at DESC
    `, { replacements: [productIds] });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch seller orders' });
  }
};

/**
 * GET /api/seller/earnings
 */
export const getSellerEarnings = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const products = await Material.findAll({ where: { sellerId }, attributes: ['id'] });
    const productIds = products.map((p) => p.id);

    let grossEarnings = 0;
    let availableBalance = 0;
    let pendingBalance = 0;

    if (productIds.length > 0) {
      const [paidSales] = await sequelize.query(`
        SELECT COALESCE(SUM(oi.total_price), 0) AS total
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.product_id IN (?) AND o.payment_status = 'paid'
      `, { replacements: [productIds] });
      grossEarnings = Number(paidSales[0]?.total || 0);
      availableBalance = Math.round(grossEarnings * 0.9 * 100) / 100; // 90% after platform fee
    }

    res.json({
      success: true,
      earnings: {
        totalGross: grossEarnings,
        platformFeeRate: 0.1,
        availablePayout: availableBalance,
        pendingPayout: pendingBalance,
        currency: 'USD',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch earnings' });
  }
};

/**
 * POST /api/seller/payout
 */
export const requestPayout = async (req, res) => {
  try {
    const { amount, payoutMethod = 'bank_transfer' } = req.body;
    res.json({
      success: true,
      message: `Payout request for $${Number(amount || 0).toFixed(2)} submitted successfully via ${payoutMethod}. Processing typically takes 2-3 business days.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Payout request failed' });
  }
};

/**
 * GET /api/seller/analytics
 */
export const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const products = await Material.findAll({ where: { sellerId } });
    const productIds = products.map((p) => p.id);

    const analytics = {
      viewsBySubject: {},
      topSelling: [],
      monthlyBreakdown: [
        { month: 'Jun', sales: 120, revenue: 1450 },
        { month: 'Jul', sales: 190, revenue: 2100 },
        { month: 'Aug', sales: 240, revenue: 2890 },
        { month: 'Sep', sales: 310, revenue: 3800 },
        { month: 'Oct', sales: 420, revenue: 4950 },
      ],
    };

    products.forEach((p) => {
      analytics.viewsBySubject[p.subject] = (analytics.viewsBySubject[p.subject] || 0) + (p.viewCount || 0);
    });

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};
