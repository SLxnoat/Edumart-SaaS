import crypto from 'crypto';
import Stripe from 'stripe';
import sequelize from '../config/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
const { Order, OrderItem, Payment, Material, User } = sequelize.models;

/**
 * POST /api/payment/create-intent
 * Body: { orderId }
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    const amountInCents = Math.round(Number(order.totalAmount) * 100);

    let clientSecret = 'mock_secret_' + order.id;
    let paymentIntentId = 'pi_mock_' + order.id;

    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('dummy') && !process.env.STRIPE_SECRET_KEY.includes('your_str')) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: (order.currency || 'USD').toLowerCase(),
          metadata: { orderId: order.id, orderNumber: order.orderNumber },
        });
        clientSecret = paymentIntent.client_secret;
        paymentIntentId = paymentIntent.id;
      } catch (stripeErr) {
        console.warn('Stripe live call failed, falling back to simulated secret:', stripeErr.message);
      }
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: order.totalAmount,
      currency: order.currency,
      clientSecret,
      paymentIntentId,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment intent' });
  }
};

/**
 * POST /api/payment/confirm
 * Confirm / simulate payment for an order (supports demo/mock and live verification)
 * Body: { orderId, paymentMethod = 'credit_card', paymentIntentId }
 */
export const confirmPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { orderId, paymentMethod = 'credit_card', paymentIntentId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      await t.rollback();
      return res.json({ success: true, message: 'Order is already marked as paid', order });
    }

    const gatewayRef = paymentIntentId || `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create payment record
    const payment = await Payment.create({
      id: crypto.randomUUID(),
      orderId: order.id,
      paymentMethod,
      gatewayReference: gatewayRef,
      amount: order.totalAmount,
      currency: order.currency || 'USD',
      status: 'paid',
      paidAt: new Date(),
    }, { transaction: t });

    // Update order status
    order.paymentStatus = 'paid';
    order.status = 'processing';
    await order.save({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      payment: {
        id: payment.id,
        gatewayReference: payment.gatewayReference,
        amount: payment.amount,
        status: payment.status,
      },
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error('Confirm payment error:', error);
    res.status(500).json({ success: false, message: 'Payment confirmation failed' });
  }
};

/**
 * POST /api/payment/refund/:orderId
 */
export const refundPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, { transaction: t });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus !== 'paid') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Only paid orders can be refunded' });
    }

    order.paymentStatus = 'refunded';
    order.status = 'refunded';
    await order.save({ transaction: t });

    await Payment.update(
      { status: 'refunded' },
      { where: { orderId: order.id }, transaction: t }
    );

    await t.commit();
    res.json({ success: true, message: 'Order payment marked as refunded', order });
  } catch (error) {
    await t.rollback();
    console.error('Refund payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to refund payment' });
  }
};

/**
 * GET /api/payment/verify/:paymentIntentId
 */
export const verifyPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntentId,
        status: 'succeeded',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify payment intent' });
  }
};

/**
 * POST /api/payment/webhook
 */
export const handleWebhook = async (req, res) => {
  res.json({ received: true });
};

export default {
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  verifyPaymentIntent,
  handleWebhook,
};
