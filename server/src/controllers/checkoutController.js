import crypto from 'crypto';
import sequelize from '../config/db.js';
import { toProduct } from './catalogController.js';

const { Cart, CartItem, Material, Order, OrderItem, Coupon, Payment, User } = sequelize.models;

const TAX_RATE = 0.1;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Helper to calculate totals & validate coupons
export const evaluateCheckout = async ({ cart, couponCode, shippingAddress }) => {
  const items = await CartItem.findAll({
    where: { cartId: cart.id },
    include: [{ model: Material, as: 'material' }],
  });

  if (!items.length) {
    throw new HttpError(400, 'Cart is empty');
  }

  let subtotal = 0;
  let hasPhysical = false;

  const lineItems = items.map((ci) => {
    const mat = ci.material;
    if (!mat || !mat.isActive || !mat.isApproved) {
      throw new HttpError(400, `Item "${mat ? mat.title : ci.materialId}" is no longer available`);
    }
    if (mat.format !== 'digital') {
      hasPhysical = true;
      if (mat.stockQuantity < ci.quantity) {
        throw new HttpError(400, `Item "${mat.title}" has insufficient stock (${mat.stockQuantity} available)`);
      }
    }
    const unitPrice = Number(mat.price);
    const lineTotal = Math.round(unitPrice * ci.quantity * 100) / 100;
    subtotal += lineTotal;
    return {
      materialId: mat.id,
      title: mat.title,
      format: mat.format,
      quantity: ci.quantity,
      unitPrice,
      totalPrice: lineTotal,
    };
  });

  subtotal = Math.round(subtotal * 100) / 100;

  // Coupon evaluation
  let discountAmount = 0;
  let validCoupon = null;
  if (couponCode) {
    const code = couponCode.trim().toUpperCase();
    const c = await Coupon.findOne({ where: { code, isActive: true } });
    if (!c) {
      throw new HttpError(400, 'Invalid or expired coupon code');
    }
    const now = new Date();
    if (c.validFrom && new Date(c.validFrom) > now) {
      throw new HttpError(400, 'Coupon is not yet active');
    }
    if (c.validTo && new Date(c.validTo) < now) {
      throw new HttpError(400, 'Coupon has expired');
    }
    if (c.minOrderAmount && subtotal < Number(c.minOrderAmount)) {
      throw new HttpError(400, `Coupon requires a minimum order amount of $${Number(c.minOrderAmount).toFixed(2)}`);
    }
    if (c.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * (Number(c.discountValue) / 100)) * 100) / 100;
    } else {
      discountAmount = Math.min(Number(c.discountValue), subtotal);
    }
    validCoupon = c;
  }

  const shippingCost = hasPhysical ? (subtotal > 50 ? 0 : 5.00) : 0.00;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * TAX_RATE * 100) / 100;
  const totalAmount = Math.round((taxableAmount + shippingCost + taxAmount) * 100) / 100;

  return {
    lineItems,
    hasPhysical,
    subtotal,
    discountAmount,
    shippingCost,
    taxAmount,
    totalAmount,
    coupon: validCoupon ? {
      code: validCoupon.code,
      discountType: validCoupon.discountType,
      discountValue: Number(validCoupon.discountValue),
      description: validCoupon.description,
    } : null,
  };
};

/**
 * Validate coupon code endpoint (for previewing discounts in Cart/Checkout)
 * POST /api/checkout/validate-coupon
 */
export const validateCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    if (!couponCode) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;
    const cart = userId
      ? await Cart.findOne({ where: { userId } })
      : (sessionId ? await Cart.findOne({ where: { sessionId } }) : null);

    if (!cart) {
      return res.status(400).json({ success: false, message: 'Cart not found' });
    }

    const evaluation = await evaluateCheckout({ cart, couponCode });
    res.json({
      success: true,
      coupon: evaluation.coupon,
      discountAmount: evaluation.discountAmount,
      subtotal: evaluation.subtotal,
      totalAmount: evaluation.totalAmount,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Validate coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to validate coupon' });
  }
};

/**
 * Perform checkout and create an order (both guest and user)
 */
export const createOrderFromCheckout = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;
    const { couponCode, shippingAddress, billingAddress, paymentMethod = 'card', notes } = req.body;

    const cart = userId
      ? await Cart.findOne({ where: { userId } })
      : (sessionId ? await Cart.findOne({ where: { sessionId } }) : null);

    if (!cart) {
      throw new HttpError(400, 'Cart not found');
    }

    const evalResult = await evaluateCheckout({ cart, couponCode, shippingAddress });
    if (evalResult.hasPhysical && (!shippingAddress || !shippingAddress.addressLine1 || !shippingAddress.city)) {
      throw new HttpError(400, 'Shipping address is required for physical materials');
    }

    // Determine user to associate with order
    let orderUserId = userId;
    if (!orderUserId) {
      // For guest checkout, find or create a guest customer user record
      const guestEmail = shippingAddress?.email || req.body.guestEmail;
      if (!guestEmail) {
        throw new HttpError(400, 'Email address is required for guest checkout');
      }
      let guestUser = await User.findOne({ where: { email: guestEmail } });
      if (!guestUser) {
        guestUser = await User.create({
          id: crypto.randomUUID(),
          email: guestEmail,
          firstName: shippingAddress?.firstName || 'Guest',
          lastName: shippingAddress?.lastName || 'Customer',
          password: crypto.randomBytes(16).toString('hex'), // random password
          role: 'student',
          isVerified: true,
        }, { transaction: t });
      }
      orderUserId = guestUser.id;
    }

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await Order.create({
      id: crypto.randomUUID(),
      userId: orderUserId,
      orderNumber,
      status: 'pending',
      subtotal: evalResult.subtotal,
      taxAmount: evalResult.taxAmount,
      shippingCost: evalResult.shippingCost,
      discountAmount: evalResult.discountAmount,
      totalAmount: evalResult.totalAmount,
      currency: 'USD',
      paymentStatus: 'pending',
      shippingAddress: shippingAddress || null,
      billingAddress: billingAddress || shippingAddress || null,
      notes: notes || null,
    }, { transaction: t });

    // Create Order Items & reduce inventory if physical
    for (const item of evalResult.lineItems) {
      await OrderItem.create({
        id: crypto.randomUUID(),
        orderId: order.id,
        materialId: item.materialId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      }, { transaction: t });

      if (item.format !== 'digital') {
        const mat = await Material.findByPk(item.materialId, { transaction: t });
        if (mat) {
          mat.stockQuantity = Math.max(0, mat.stockQuantity - item.quantity);
          await mat.save({ transaction: t });
        }
      }
    }

    // Record Coupon usage if applied
    if (evalResult.coupon) {
      const c = await Coupon.findOne({ where: { code: evalResult.coupon.code } });
      if (c && c.maxUses > 0) {
        await sequelize.query(
          'INSERT INTO coupon_usage (id, coupon_id, user_id, order_id) VALUES (?, ?, ?, ?)',
          { replacements: [crypto.randomUUID(), c.id, orderUserId, order.id], transaction: t }
        );
      }
    }

    // Clear cart
    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        shippingCost: order.shippingCost,
        discountAmount: order.discountAmount,
        items: evalResult.lineItems,
      },
    });
  } catch (error) {
    await t.rollback();
    if (error instanceof HttpError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: 'Checkout failed' });
  }
};

export const guestCheckout = createOrderFromCheckout;
export const userCheckout = createOrderFromCheckout;

export default {
  validateCoupon,
  createOrderFromCheckout,
  guestCheckout,
  userCheckout,
};
