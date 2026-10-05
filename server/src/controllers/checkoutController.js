import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Material from '../models/Material.js';
import Coupon from '../models/Coupon.js';
import { Op } from 'sequelize';

/**
 * Get or create a cart for the current context (user or session)
 * @param {Object} req - Express request object
 * @returns {Promise<Cart>} The cart instance
 */
const getOrCreateCart = async (req) => {
  let cart;
  const userId = req.user ? req.user.id : null;
  const sessionId = req.headers['x-session-id'] || req.body.sessionId;

  if (userId) {
    // Try to get the user's cart
    cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }
  } else if (sessionId) {
    // Try to get the cart by sessionId
    cart = await Cart.findOne({ where: { sessionId } });
    if (!cart) {
      cart = await Cart.create({ sessionId });
    }
  } else {
    throw new Error('Either user must be authenticated or sessionId must be provided');
  }

  return cart;
};

/**
 * Process guest checkout
 */
export const guestCheckout = async (req, res) => {
  try {
    const { couponCode, shippingInfo, paymentInfo } = req.body;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required for guest checkout',
      });
    }

    // Process checkout for guest cart
    const checkoutResult = await processCheckout(req, null, sessionId, couponCode, shippingInfo, paymentInfo);
    res.status(200).json(checkoutResult);
  } catch (error) {
    console.error('Guest checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Guest checkout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Process user checkout
 */
export const userCheckout = async (req, res) => {
  try {
    const { couponCode, shippingInfo, paymentInfo } = req.body;
    const userId = req.user.id;

    // Process checkout for user cart
    const checkoutResult = await processCheckout(req, userId, null, couponCode, shippingInfo, paymentInfo);
    res.status(200).json(checkoutResult);
  } catch (error) {
    console.error('User checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'User checkout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Common checkout processing logic
 */
const processCheckout = async (req, userId, sessionId, couponCode, shippingInfo, paymentInfo) => {
  // Get the cart
  let cart;
  if (userId) {
    cart = await Cart.findOne({ where: { userId } });
  } else {
    cart = await Cart.findOne({ where: { sessionId } });
  }

  if (!cart) {
    throw new Error('Cart not found');
  }

  // Get cart items with material details
  const cartWithItems = await Cart.findByPk(cart.id, {
    include: [
      {
        model: CartItem,
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

  if (!cartWithItems || cartWithItems.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Calculate subtotal
  let subtotal = 0;
  cartWithItems.items.forEach(item => {
    const itemTotal = item.priceAtAddition * item.quantity;
    subtotal += itemTotal;
  });

  // Apply coupon if provided
  let discountAmount = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({
      where: {
        code: couponCode.toUpperCase(),
        isActive: true,
        [Op.and]: [
          { startDate: { [Op.lte]: new Date() } },
          { endDate: { [Op.gte]: new Date() } },
        ],
      },
    });

    if (coupon) {
      // Check usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        throw new Error('Coupon usage limit exceeded');
      }

      // Check min purchase
      if (coupon.minPurchase && subtotal < coupon.minPurchase) {
        throw new Error(`Minimum purchase of ${coupon.minPurchase} required for this coupon`);
      }

      // Calculate discount
      if (coupon.discountType === 'percentage') {
        discountAmount = subtotal * (coupon.discountValue / 100);
        // Apply max discount if set
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else if (coupon.discountType === 'fixed_amount') {
        discountAmount = coupon.discountValue;
      }
    } else {
      throw new Error('Invalid or expired coupon code');
    }
  }

  const taxRate = 0.1; // 10% tax (example)
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + taxAmount;

  // Clear the cart after successful checkout
  await CartItem.destroy({
    where: {
      cartId: cart.id,
    },
  });

  // If a coupon was used, increment its usage count
  if (coupon) {
    await coupon.increment('usageCount');
  }

  return {
    success: true,
    message: 'Checkout completed successfully',
    orderSummary: {
      cartId: cart.id,
      userId: userId || null,
      sessionId: sessionId || null,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      coupon: coupon ? {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      } : null,
      items: cartWithItems.items.map(item => ({
        materialId: item.material.id,
        title: item.material.title,
        quantity: item.quantity,
        priceAtAddition: parseFloat(item.priceAtAddition.toFixed(2)),
        total: parseFloat((item.priceAtAddition * item.quantity).toFixed(2)),
      })),
    },
    // In a real application, we would create an order record here
    // For this task, we return the summary and clear the cart
  };
};

export default {
  guestCheckout,
  userCheckout,
};
