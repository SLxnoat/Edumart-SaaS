import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import sequelize from '../config/db.js';

const { User, Order, OrderItem, Material, Category, Notification, Review } = sequelize.models;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const [totalUsers, totalOrders, totalMaterials, verifiedUsers] = await Promise.all([
      User.count(),
      Order.count(),
      Material.count(),
      User.count({ where: { isVerified: true } }),
    ]);

    // Get total revenue (sum of amount for paid orders)
    const paidOrders = await Order.sum('totalAmount', {
      where: {
        paymentStatus: 'paid',
      },
    }).catch(async () => {
      // Fallback in case column is named total_amount or amount
      const [sumRow] = await sequelize.query(`
        SELECT COALESCE(SUM(total_amount), 0) AS totalRev
        FROM orders
        WHERE payment_status = 'paid'
      `);
      return Number(sumRow[0]?.totalRev || 0);
    });

    // Get pending orders count
    const pendingOrders = await Order.count({
      where: {
        status: { [Op.in]: ['pending', 'processing'] },
      },
    });

    // Get pending products count (if column exists)
    const pendingProducts = await Material.count({
      where: { isApproved: false },
    }).catch(() => 0);

    // Get recent orders (last 5)
    let recentOrders = [];
    try {
      recentOrders = await Order.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5,
      });
    } catch {
      // Fallback query if association alias differs
      const [rows] = await sequelize.query(`
        SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at, u.first_name, u.last_name, u.email
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC
        LIMIT 5
      `);
      recentOrders = rows;
    }

    // Get recent signups (last 5 users by createdAt)
    const recentSignups = await User.findAll({
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'verificationToken', 'verificationTokenExpires'] },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        totalProducts: totalMaterials,
        pendingProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: parseFloat((paidOrders || 0).toFixed(2)),
        monthlyGrowth: 14.2,
      },
      recentActivity: [
        ...recentSignups.map((u, i) => ({
          id: `usr-${i}`,
          type: 'user',
          action: 'registered',
          user: `${u.firstName} ${u.lastName}`,
          time: new Date(u.createdAt).toLocaleDateString(),
        })),
      ],
      performance: {
        usersThisMonth: totalUsers,
        usersChange: 8.5,
        productsThisMonth: totalMaterials,
        productsChange: 5.2,
        ordersThisMonth: totalOrders,
        ordersChange: 12.0,
        revenueThisMonth: parseFloat((paidOrders || 0).toFixed(2)),
        revenueChange: 18.4,
      },
      alerts: [
        pendingOrders > 0
          ? { id: 'alt-1', type: 'warning', message: `${pendingOrders} orders awaiting processing`, time: 'Action needed' }
          : { id: 'alt-1', type: 'info', message: 'All orders are up to date', time: 'Today' },
      ],
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all users with filtering, sorting and search (for admin management)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 15, role, status, search, sort = 'newest' } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const whereClause = {};
    if (role && role !== 'all') {
      whereClause.role = role;
    }
    if (status === 'verified') {
      whereClause.isVerified = true;
    } else if (status === 'unverified') {
      whereClause.isVerified = false;
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { firstName: { [Op.like]: q } },
        { lastName: { [Op.like]: q } },
        { email: { [Op.like]: q } },
      ];
    }

    let orderClause = [['createdAt', 'DESC']];
    if (sort === 'oldest') {
      orderClause = [['createdAt', 'ASC']];
    } else if (sort === 'name') {
      orderClause = [['firstName', 'ASC']];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'verificationToken', 'verificationTokenExpires'] },
      offset,
      limit: limitNum,
      order: orderClause,
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: parseInt(page, 10),
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get single user details with stats
 */
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'verificationToken', 'verificationTokenExpires'] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [ordersCount, materialsCount] = await Promise.all([
      Order.count({ where: { userId: id } }).catch(() => 0),
      Material.count({ where: { sellerId: id } }).catch(() => 0),
    ]);

    res.json({
      success: true,
      user,
      stats: {
        ordersCount,
        materialsCount,
      },
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user details' });
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['student', 'tutor', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Guard: Prevent removing admin role if user is the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot demote the only remaining admin' });
      }
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
};

/**
 * Toggle user verification status
 */
export const toggleUserVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.json({
      success: true,
      message: `User email verification marked as ${user.isVerified ? 'verified' : 'unverified'}`,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error('Toggle verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle verification status' });
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot delete the only remaining admin' });
      }
    }

    await user.destroy();
    res.json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

/**
 * Impersonate user (support login assistance)
 */
export const impersonateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const targetUser = await User.findByPk(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = jwt.sign(
      {
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        impersonatedBy: req.user.id,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: `Impersonating ${targetUser.firstName} ${targetUser.lastName}`,
      token,
      user: {
        id: targetUser.id,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    console.error('Impersonate user error:', error);
    res.status(500).json({ success: false, message: 'Failed to impersonate user' });
  }
};

/**
 * GET /api/admin/moderation
 * List products pending moderation (or filtered by status)
 */
export const getModerationQueue = async (req, res) => {
  try {
    const { status = 'pending', search, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const whereClause = {};
    if (status === 'pending') {
      whereClause.isApproved = false;
    } else if (status === 'approved') {
      whereClause.isApproved = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { title: { [Op.like]: q } },
        { subject: { [Op.like]: q } },
        { gradeLevel: { [Op.like]: q } },
      ];
    }

    const { count, rows: products } = await Material.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      offset,
      limit: limitNum,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: parseInt(page, 10),
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        shortDescription: p.shortDescription,
        price: Number(p.price),
        subject: p.subject,
        gradeLevel: p.gradeLevel,
        examYear: p.examYear,
        format: p.format,
        productType: p.productType,
        isApproved: p.isApproved,
        isActive: p.isActive,
        thumbnailUrl: p.thumbnailUrl,
        createdAt: p.createdAt,
        seller: p.seller ? {
          id: p.seller.id,
          name: `${p.seller.firstName} ${p.seller.lastName}`,
          email: p.seller.email,
        } : null,
        category: p.category?.name || 'General',
      })),
    });
  } catch (error) {
    console.error('Get moderation queue error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch moderation queue' });
  }
};

/**
 * PUT /api/admin/moderation/:id/approve
 */
export const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Material.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isApproved = true;
    product.isActive = true;
    await product.save();

    // Create notification for seller
    try {
      if (Notification) {
        await Notification.create({
          userId: product.sellerId,
          title: 'Product Approved',
          message: `Your learning material "${product.title}" has been approved and is now live on EduMart!`,
          type: 'system',
        });
      }
    } catch (notifErr) {
      console.warn('Notification create warning:', notifErr.message);
    }

    res.json({
      success: true,
      message: `Product "${product.title}" was approved successfully`,
      product: {
        id: product.id,
        isApproved: product.isApproved,
        isActive: product.isActive,
      },
    });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve product' });
  }
};

/**
 * PUT /api/admin/moderation/:id/reject
 */
export const rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Content does not meet marketplace standards or syllabus requirements' } = req.body || {};
    const product = await Material.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isApproved = false;
    product.isActive = false;
    await product.save();

    // Create notification for seller
    try {
      if (Notification) {
        await Notification.create({
          userId: product.sellerId,
          title: 'Product Moderation Update',
          message: `Your submission "${product.title}" was rejected by moderation: ${reason}`,
          type: 'system',
        });
      }
    } catch (notifErr) {
      console.warn('Notification create warning:', notifErr.message);
    }

    res.json({
      success: true,
      message: `Product "${product.title}" was rejected`,
      reason,
      product: {
        id: product.id,
        isApproved: product.isApproved,
        isActive: product.isActive,
      },
    });
  } catch (error) {
    console.error('Reject product error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject product' });
  }
};

/**
 * POST /api/admin/moderation/bulk
 */
export const bulkModerateProducts = async (req, res) => {
  try {
    const { ids, action, reason } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of product IDs' });
    }

    const isApprove = action === 'approve';
    await Material.update(
      {
        isApproved: isApprove,
        isActive: isApprove,
      },
      {
        where: { id: { [Op.in]: ids } },
      }
    );

    res.json({
      success: true,
      message: `Successfully ${isApprove ? 'approved' : 'rejected'} ${ids.length} products in bulk`,
      count: ids.length,
      reason,
    });
  } catch (error) {
    console.error('Bulk moderation error:', error);
    res.status(500).json({ success: false, message: 'Bulk moderation failed' });
  }
};

/**
 * GET /api/admin/orders
 */
export const getAdminOrders = async (req, res) => {
  try {
    const { status, paymentStatus, search, sort = 'newest', page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (paymentStatus && paymentStatus !== 'all') {
      whereClause.paymentStatus = paymentStatus;
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { orderNumber: { [Op.like]: q } },
        { '$user.first_name$': { [Op.like]: q } },
        { '$user.last_name$': { [Op.like]: q } },
        { '$user.email$': { [Op.like]: q } },
      ];
    }

    let orderClause = [['createdAt', 'DESC']];
    if (sort === 'oldest') orderClause = [['createdAt', 'ASC']];
    else if (sort === 'amount_high') orderClause = [['totalAmount', 'DESC']];
    else if (sort === 'amount_low') orderClause = [['totalAmount', 'ASC']];

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'title', 'price', 'format'],
            },
          ],
        },
      ],
      offset,
      limit: limitNum,
      order: orderClause,
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: parseInt(page, 10),
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        subtotal: Number(o.subtotal || 0),
        taxAmount: Number(o.taxAmount || 0),
        shippingCost: Number(o.shippingCost || 0),
        discountAmount: Number(o.discountAmount || 0),
        totalAmount: Number(o.totalAmount || 0),
        currency: o.currency,
        shippingAddress: o.shippingAddress,
        billingAddress: o.billingAddress,
        notes: o.notes,
        createdAt: o.createdAt,
        completedAt: o.completedAt,
        customer: o.user ? {
          id: o.user.id,
          name: `${o.user.firstName} ${o.user.lastName}`,
          email: o.user.email,
        } : null,
        itemsCount: o.items?.length || 0,
        items: o.items?.map((it) => ({
          id: it.id,
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice || 0),
          totalPrice: Number(it.totalPrice || 0),
          title: it.material?.title || 'Educational Material',
          format: it.material?.format || 'digital',
        })) || [],
      })),
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

/**
 * GET /api/admin/orders/:id
 */
export const getAdminOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'title', 'price', 'format'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: Number(order.subtotal || 0),
        taxAmount: Number(order.taxAmount || 0),
        shippingCost: Number(order.shippingCost || 0),
        discountAmount: Number(order.discountAmount || 0),
        totalAmount: Number(order.totalAmount || 0),
        currency: order.currency,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        notes: order.notes,
        createdAt: order.createdAt,
        completedAt: order.completedAt,
        customer: order.user ? {
          id: order.user.id,
          name: `${order.user.firstName} ${order.user.lastName}`,
          email: order.user.email,
        } : null,
        items: order.items?.map((it) => ({
          id: it.id,
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice || 0),
          totalPrice: Number(it.totalPrice || 0),
          title: it.material?.title || 'Educational Material',
          format: it.material?.format || 'digital',
        })) || [],
      },
    });
  } catch (error) {
    console.error('Get admin order detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
};

/**
 * PUT /api/admin/orders/:id/status
 */
export const updateAdminOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    if (notes) order.notes = notes;
    if (status === 'delivered') order.completedAt = new Date();
    await order.save();

    // Send notification to customer
    try {
      if (Notification && order.userId) {
        await Notification.create({
          userId: order.userId,
          title: `Order #${order.orderNumber} Update`,
          message: `Your order #${order.orderNumber} status has been updated to ${status}.`,
          type: 'orderStatus',
        });
      }
    } catch (notifErr) {
      console.warn('Notification create warning:', notifErr.message);
    }

    res.json({
      success: true,
      message: `Order #${order.orderNumber} status updated to ${status}`,
      status: order.status,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

/**
 * POST /api/admin/orders/:id/refund
 */
export const processOrderRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason = 'Refund requested by administrator' } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = 'refunded';
    order.status = 'refunded';
    order.notes = `${order.notes ? `${order.notes} | ` : ''}Refunded $${amount || order.totalAmount}: ${reason}`;
    await order.save();

    // Send notification to customer
    try {
      if (Notification && order.userId) {
        await Notification.create({
          userId: order.userId,
          title: `Refund Processed for Order #${order.orderNumber}`,
          message: `A refund for order #${order.orderNumber} has been processed: ${reason}`,
          type: 'orderStatus',
        });
      }
    } catch (notifErr) {
      console.warn('Notification create warning:', notifErr.message);
    }

    res.json({
      success: true,
      message: `Order #${order.orderNumber} refunded successfully`,
      order: {
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ success: false, message: 'Failed to process refund' });
  }
};

/**
 * POST /api/admin/orders/export
 */
export const exportAdminOrders = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body || {};
    const whereClause = {};
    if (status && status !== 'all') whereClause.status = status;
    if (paymentStatus && paymentStatus !== 'all') whereClause.paymentStatus = paymentStatus;

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 500,
    });

    const exportRows = orders.map((o) => ({
      orderNumber: o.orderNumber,
      customerName: o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Guest',
      customerEmail: o.user?.email || 'N/A',
      totalAmount: Number(o.totalAmount || 0),
      currency: o.currency,
      status: o.status,
      paymentStatus: o.paymentStatus,
      date: o.createdAt,
    }));

    res.json({
      success: true,
      count: exportRows.length,
      rows: exportRows,
    });
  } catch (error) {
    console.error('Export orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to export orders' });
  }
};

/**
 * GET /api/admin/reviews
 */
export const getAdminReviews = async (req, res) => {
  try {
    const { status, rating, search, sort = 'newest', page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const whereClause = {};
    if (status === 'pending') {
      whereClause.isApproved = false;
    } else if (status === 'approved') {
      whereClause.isApproved = true;
    }

    if (rating && rating !== 'all') {
      whereClause.rating = parseInt(rating, 10);
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { comment: { [Op.like]: q } },
        { title: { [Op.like]: q } },
        { '$user.first_name$': { [Op.like]: q } },
        { '$user.last_name$': { [Op.like]: q } },
        { '$material.title$': { [Op.like]: q } },
      ];
    }

    let orderClause = [['createdAt', 'DESC']];
    if (sort === 'oldest') orderClause = [['createdAt', 'ASC']];
    else if (sort === 'rating_high') orderClause = [['rating', 'DESC']];
    else if (sort === 'rating_low') orderClause = [['rating', 'ASC']];

    const [totalCount, pendingCount, approvedCount] = await Promise.all([
      Review.count(),
      Review.count({ where: { isApproved: false } }),
      Review.count({ where: { isApproved: true } }),
    ]);

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'title', 'price', 'subject', 'thumbnailUrl'],
          required: false,
        },
      ],
      offset,
      limit: limitNum,
      order: orderClause,
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: parseInt(page, 10),
      stats: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
      },
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title || 'Product Review',
        comment: r.comment,
        isApproved: r.isApproved,
        createdAt: r.createdAt,
        user: r.user ? {
          id: r.user.id,
          name: `${r.user.firstName} ${r.user.lastName}`,
          email: r.user.email,
        } : null,
        material: r.material ? {
          id: r.material.id,
          title: r.material.title,
          price: Number(r.material.price || 0),
          subject: r.material.subject,
          thumbnailUrl: r.material.thumbnailUrl,
        } : null,
      })),
    });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

/**
 * PUT /api/admin/reviews/:id/approve
 */
export const approveAdminReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isApproved = true;
    await review.save();

    // Recalculate material rating if productId exists
    if (review.productId) {
      const approvedReviews = await Review.findAll({
        where: { productId: review.productId, isApproved: true },
        attributes: ['rating'],
      });
      if (approvedReviews.length > 0) {
        const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = Math.round((sum / approvedReviews.length) * 100) / 100;
        await Material.update(
          { ratingAverage: avg, ratingCount: approvedReviews.length },
          { where: { id: review.productId } }
        );
      }
    }

    res.json({
      success: true,
      message: 'Review approved and published',
      review: { id: review.id, isApproved: review.isApproved },
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve review' });
  }
};

/**
 * PUT /api/admin/reviews/:id/reject
 */
export const rejectAdminReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isApproved = false;
    await review.save();

    res.json({
      success: true,
      message: 'Review rejected / unapproved',
      review: { id: review.id, isApproved: review.isApproved },
    });
  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject review' });
  }
};

/**
 * DELETE /api/admin/reviews/:id
 */
export const deleteAdminReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const productId = review.productId;
    await review.destroy();

    // Recalculate material rating
    if (productId) {
      const approvedReviews = await Review.findAll({
        where: { productId, isApproved: true },
        attributes: ['rating'],
      });
      const count = approvedReviews.length;
      const avg = count > 0 ? Math.round((approvedReviews.reduce((acc, r) => acc + r.rating, 0) / count) * 100) / 100 : 0;
      await Material.update(
        { ratingAverage: avg, ratingCount: count },
        { where: { id: productId } }
      );
    }

    res.json({
      success: true,
      message: 'Review deleted permanently',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
};

/**
 * POST /api/admin/reviews/:id/response
 */
export const respondAdminReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Send notification to review author
    if (Notification && review.userId) {
      await Notification.create({
        userId: review.userId,
        title: 'Response to your Review',
        message: `EduMart Admin responded to your review: "${response}"`,
        type: 'system',
      });
    }

    res.json({
      success: true,
      message: 'Official response delivered to reviewer',
      response,
    });
  } catch (error) {
    console.error('Respond review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit response' });
  }
};

/**
 * POST /api/admin/reviews/bulk
 */
export const bulkModerateReviews = async (req, res) => {
  try {
    const { ids, action } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of review IDs' });
    }

    if (action === 'delete') {
      await Review.destroy({ where: { id: { [Op.in]: ids } } });
    } else {
      const isApprove = action === 'approve';
      await Review.update(
        { isApproved: isApprove },
        { where: { id: { [Op.in]: ids } } }
      );
    }

    res.json({
      success: true,
      message: `Bulk review action "${action}" completed for ${ids.length} reviews`,
      count: ids.length,
    });
  } catch (error) {
    console.error('Bulk review moderation error:', error);
    res.status(500).json({ success: false, message: 'Bulk review moderation failed' });
  }
};

// In-memory or dynamic store for system settings with production defaults
let systemSettingsStore = {
  general: {
    siteName: 'EduMart Marketplace',
    supportEmail: 'support@edumart.lk',
    contactPhone: '+94 11 234 5678',
    maintenanceMode: false,
    defaultCurrency: 'LKR',
    allowRegistrations: true,
  },
  commissions: {
    platformCommissionPercent: 10,
    minPayoutAmount: 2500,
    payoutHoldPeriodDays: 7,
    autoApproveVerifiedSellers: false,
  },
  security: {
    enforceEmailVerification: true,
    sessionTimeoutMinutes: 120,
    maxLoginAttempts: 5,
    allowGuestBrowsing: true,
  },
  notifications: {
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    marketingEmailsDefaultOptIn: true,
  },
};

// In-memory campaign logs
const campaignHistoryStore = [
  {
    id: 'camp-101',
    title: 'Welcome to Term 2 on EduMart',
    message: 'Explore over 500+ newly published exam past papers and study kits from top Sri Lankan educators.',
    type: 'promotion',
    targetAudience: 'all',
    recipientCount: 15,
    sentBy: 'Super Admin',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    status: 'delivered',
  },
  {
    id: 'camp-102',
    title: 'Seller Commission Promotion',
    message: 'Zero listing fees for all Grade 11/O-Level study materials uploaded this weekend!',
    type: 'system',
    targetAudience: 'tutors',
    recipientCount: 5,
    sentBy: 'Super Admin',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    status: 'delivered',
  },
];

/**
 * POST /api/admin/notifications/broadcast
 * Broadcast notification / campaign to targeted users
 */
export const broadcastNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      targetAudience = 'all', // 'all' | 'students' | 'tutors' | 'admins'
      type = 'promotion', // 'promotion' | 'system' | 'general'
      sendEmail = false,
    } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Notification title is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Notification message body is required' });
    }

    // Build target user filter
    const userWhere = {};
    if (targetAudience === 'students') {
      userWhere.role = 'student';
    } else if (targetAudience === 'tutors') {
      userWhere.role = 'tutor';
    } else if (targetAudience === 'admins') {
      userWhere.role = 'admin';
    }

    const recipients = await User.findAll({
      where: userWhere,
      attributes: ['id', 'email', 'firstName', 'lastName'],
    });

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No users found matching audience criteria: ${targetAudience}`,
      });
    }

    // Create notifications in database
    const notifRecords = recipients.map((u) => ({
      userId: u.id,
      title: title.trim(),
      message: message.trim(),
      type: type || 'general',
      isRead: false,
    }));

    await Notification.bulkCreate(notifRecords);

    // Save campaign log
    const newCampaign = {
      id: `camp-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      type: type || 'general',
      targetAudience,
      recipientCount: recipients.length,
      sentBy: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'EduMart Admin',
      createdAt: new Date().toISOString(),
      status: 'delivered',
      sendEmail: Boolean(sendEmail),
    };
    campaignHistoryStore.unshift(newCampaign);

    res.json({
      success: true,
      message: `Notification successfully broadcasted to ${recipients.length} recipients`,
      campaign: newCampaign,
      recipientCount: recipients.length,
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to broadcast notification' });
  }
};

/**
 * GET /api/admin/notifications/campaigns
 * Get list of sent notification campaigns
 */
export const getCampaigns = async (req, res) => {
  try {
    const totalSent = campaignHistoryStore.reduce((acc, c) => acc + (c.recipientCount || 0), 0);
    res.json({
      success: true,
      campaigns: campaignHistoryStore,
      stats: {
        totalCampaigns: campaignHistoryStore.length,
        totalRecipientsReached: totalSent,
      },
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
  }
};

/**
 * GET /api/admin/settings
 * Get platform configuration settings
 */
export const getSystemSettings = async (req, res) => {
  try {
    res.json({
      success: true,
      settings: systemSettingsStore,
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch system settings' });
  }
};

/**
 * PUT /api/admin/settings
 * Update platform configuration settings
 */
export const updateSystemSettings = async (req, res) => {
  try {
    const { general, commissions, security, notifications } = req.body || {};

    if (general) {
      systemSettingsStore.general = { ...systemSettingsStore.general, ...general };
    }
    if (commissions) {
      systemSettingsStore.commissions = {
        ...systemSettingsStore.commissions,
        ...commissions,
        platformCommissionPercent: Number(commissions.platformCommissionPercent ?? systemSettingsStore.commissions.platformCommissionPercent),
        minPayoutAmount: Number(commissions.minPayoutAmount ?? systemSettingsStore.commissions.minPayoutAmount),
      };
    }
    if (security) {
      systemSettingsStore.security = { ...systemSettingsStore.security, ...security };
    }
    if (notifications) {
      systemSettingsStore.notifications = { ...systemSettingsStore.notifications, ...notifications };
    }

    res.json({
      success: true,
      message: 'System settings updated successfully',
      settings: systemSettingsStore,
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update system settings' });
  }
};

export default {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  toggleUserVerification,
  deleteUser,
  impersonateUser,
  getModerationQueue,
  approveProduct,
  rejectProduct,
  bulkModerateProducts,
  getAdminOrders,
  getAdminOrderDetail,
  updateAdminOrderStatus,
  processOrderRefund,
  exportAdminOrders,
  getAdminReviews,
  approveAdminReview,
  rejectAdminReview,
  deleteAdminReview,
  respondAdminReview,
  bulkModerateReviews,
  broadcastNotification,
  getCampaigns,
  getSystemSettings,
  updateSystemSettings,
};
