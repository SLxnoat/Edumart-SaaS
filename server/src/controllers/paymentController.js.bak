import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Material from '../models/Material.js';
import { Op } from 'sequelize';

/**
 * Get or create an order for the current context (user or session)
 * @param {Object} req - Express request object
 * @returns {Promise<Order>} The order instance
 */
const getOrCreateOrder = async (req) => {
  let order;
  const userId = req.user ? req.user.id : null;
  const sessionId = req.headers['x-session-id'] || req.body.sessionId;

  if (userId) {
    // Try to get the user's most recent pending order
    order = await Order.findOne({ 
      where: { 
        userId,
        paymentStatus: 'pending'
      },
      order: [['createdAt', 'DESC']]
    });
    if (!order) {
      order = await Order.create({ userId });
    }
  } else if (sessionId) {
    // Try to get the order by sessionId
    order = await Order.findOne({ 
      where: { 
        sessionId,
        paymentStatus: 'pending'
      },
      order: [['createdAt', 'DESC']]
    });
    if (!order) {
      order = await Order.create({ sessionId });
    }
  } else {
    throw new Error('Either user must be authenticated or sessionId must be provided');
  }

  return order;
};

/**
 * Create a Stripe payment intent for an order
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { shippingInfo } = req.body;
    if (!shippingInfo) {
      return res.status(400).json({
        success: false,
        message: 'Shipping information is required',
      });
    }

    // Get or create the order
    const order = await getOrCreateOrder(req);

    // If the order already has items, we need to calculate the amount from the cart
    // But for simplicity, we'll assume the cart is the source of truth for the order items.
    // We'll get the cart for the current context.
    let cart;
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;

    if (userId) {
      cart = await Cart.findOne({ where: { userId } });
    } else {
      cart = await Cart.findOne({ where: { sessionId } });
    }

    if (!cart) {
      return res.status(400).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Get cart items with material details
    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'title', 'price', 'isFree'],
        },
      ],
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Calculate the total amount
    let amount = 0; // in cents
    cartItems.forEach(item => {
      const itemPrice = item.material.isFree ? 0 : item.material.price;
      amount += (itemPrice * 100) * item.quantity; // convert to cents
    });

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe expects integer amount in cents
      currency: order.currency || 'usd',
      // In a real application, you would attach the customer ID if the user is logged in
      // We'll use the order ID as the metadata to link the payment intent to the order
      metadata: {
        orderId: order.id,
      },
    });

    // Update the order with the payment intent ID and amount
    await order.update({
      paymentIntentId: paymentIntent.id,
      amount: amount / 100, // store in dollars
      currency: order.currency || 'usd',
      shippingName: shippingInfo.name,
      shippingAddressLine1: shippingInfo.addressLine1,
      shippingAddressLine2: shippingInfo.addressLine2 || '',
      shippingCity: shippingInfo.city,
      shippingState: shippingInfo.state,
      shippingPostalCode: shippingInfo.postalCode,
      shippingCountry: shippingInfo.country,
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Handle Stripe webhook events
 */
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy');
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      handlePaymentIntentSucceeded(paymentIntentSucceeded);
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object;
      // Then define and call a function to handle the event payment_intent.payment_failed
      handlePaymentIntentFailed(paymentIntentFailed);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};

/**
 * Helper function to handle a successful payment intent
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) {
    console.error(`No orderId in paymentIntent metadata: ${paymentIntent.id}`);
    return;
  }

  try {
    // Find the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      console.error(`Order not found for id: ${orderId}`);
      return;
    }

    // Update the order
    await order.update({
      paymentStatus: 'paid',
      status: 'processing', // or whatever your next step is
    });

    // TODO: Clear the cart associated with this order
    // We would need to link the cart to the order. For now, we assume the cart is cleared elsewhere.

    console.log(`PaymentIntent ${paymentIntent.id} was successful and order ${orderId} updated.`);
  } catch (error) {
    console.error(`Error handling payment intent succeeded: ${error.message}`);
  }
};

/**
 * Helper function to handle a failed payment intent
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) {
    console.error(`No orderId in paymentIntent metadata: ${paymentIntent.id}`);
    return;
  }

  try {
    // Find the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      console.error(`Order not found for id: ${orderId}`);
      return;
    }

    // Update the order
    await order.update({
      paymentStatus: 'failed',
      // status remains as it was (probably pending)
    });

    console.log(`PaymentIntent ${paymentIntent.id} failed and order ${orderId} updated.`);
  } catch (error) {
    console.error(`Error handling payment intent failed: ${error.message}`);
  }
};
