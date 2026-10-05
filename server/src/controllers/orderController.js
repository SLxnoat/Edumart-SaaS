import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Material from '../models/Material.js';
import { Op } from 'sequelize';

/**
 * Get order history for the authenticated user
 * Supports pagination and filtering by status
 */
export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'title', 'price', 'isFree'],
            },
          ],
        },
      ],
      offset,
      limit: limitNum,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: parseInt(page),
      orders,
    });
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get a specific order by ID (for authenticated user)
 */
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'title', 'price', 'isFree'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    // Only admin can update order status via this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: admin only',
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    await order.update({ status });

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Cancel an order (user can cancel their own order if not paid)
 */
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, userId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied',
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a paid order. Please request a refund instead.',
      });
    }

    // Update order status to cancelled
    await order.update({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      message: 'Order cancelled',
      order,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get invoice/receipt for an order (simplified as JSON)
 */
export const getOrderInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'title', 'price', 'isFree'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied',
      });
    }

    // Calculate totals from order items (should match order.amount, but we recompute for safety)
    let subtotal = 0;
    order.items.forEach(item => {
      const itemTotal = item.priceAtPurchase * item.quantity;
      subtotal += itemTotal;
    });
    const taxRate = 0.1; // 10% tax (example)
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    const invoice = {
      orderId: order.id,
      orderDate: order.createdAt,
      status: order.status,
      paymentStatus: order.paymentStatus,
      customer: {
        userId: order.userId,
      },
      items: order.items.map(item => ({
        materialId: item.material.id,
        title: item.material.title,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        total: item.priceAtPurchase * item.quantity,
      })),
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      // In a real system, you might generate a PDF or HTML template here.
    };

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error('Get order invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export default {
  getOrderHistory,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderInvoice,
};
