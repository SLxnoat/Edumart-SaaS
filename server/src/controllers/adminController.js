import Order from '../models/Order.js';
import User from '../models/User.js';
import Material from '../models/Material.js';
import { Op } from 'sequelize';

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const [totalUsers, totalOrders, totalMaterials] = await Promise.all([
      User.count(),
      Order.count(),
      Material.count(),
    ]);

    // Get total revenue (sum of amount for paid/refunded? We'll sum amount for orders with paymentStatus paid)
    const paidOrders = await Order.sum('amount', {
      where: {
        paymentStatus: 'paid',
      },
    });

    // Get pending orders count
    const pendingOrders = await Order.count({
      where: {
        status: 'pending',
      },
    });

    // Get recent orders (last 5)
    const recentOrders = await Order.findAll({
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

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalMaterials,
        totalRevenue: parseFloat((paidOrders || 0).toFixed(2)),
        pendingOrders,
        recentOrders,
      },
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
 * Get all users (for admin management)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const whereClause = {};
    if (role) {
      whereClause.role = role;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'verificationToken', 'verificationTokenExpires'] },
      offset,
      limit: limitNum,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: parseInt(page),
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

export default {
  getDashboardStats,
  getAllUsers,
};
