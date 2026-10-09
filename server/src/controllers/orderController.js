import sequelize from '../config/db.js';

const { Order, OrderItem, Material, Payment, User } = sequelize.models;

/**
 * GET /api/orders or /api/orders/history
 * Fetch orders for the authenticated user
 */
export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

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
              attributes: ['id', 'title', 'price', 'thumbnailUrl', 'format'],
            },
          ],
        },
        {
          model: Payment,
          as: 'payments',
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
      currentPage: parseInt(page, 10),
      orders,
    });
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order history',
    });
  }
};

/**
 * GET /api/orders/:id
 * Retrieve specific order by ID or orderNumber
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // optional if accessed right after checkout or by user

    const where = id.startsWith('ORD-') ? { orderNumber: id } : { id };
    if (userId && req.user.role !== 'admin') {
      where.userId = userId;
    }

    const order = await Order.findOne({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'title', 'price', 'thumbnailUrl', 'format'],
            },
          ],
        },
        {
          model: Payment,
          as: 'payments',
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
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
    });
  }
};

/**
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: admin only',
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed'];
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
    });
  }
};

/**
 * DELETE /api/orders/:id
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
    });
  }
};

/**
 * GET /api/orders/:id/invoice
 */
export const getOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const where = id.startsWith('ORD-') ? { orderNumber: id } : { id };
    if (userId && req.user.role !== 'admin') {
      where.userId = userId;
    }

    const order = await Order.findOne({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
            },
          ],
        },
        {
          model: Payment,
          as: 'payments',
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      invoice: {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        shippingCost: order.shippingCost,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        items: order.items,
        payments: order.payments,
      },
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
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
