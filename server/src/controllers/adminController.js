import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import sequelize from '../config/db.js';

const { User, Order, Material } = sequelize.models;
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

export default {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  toggleUserVerification,
  deleteUser,
  impersonateUser,
};
