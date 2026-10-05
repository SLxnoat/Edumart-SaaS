import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Material from '../models/Material.js';
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
 * Get the cart for the current context
 */
export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    // Include cart items with material details
    const cartWithItems = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'title', 'price', 'isFree', 'thumbnailUrl'],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      cart: cartWithItems,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Add a material to the cart
 */
export const addToCart = async (req, res) => {
  try {
    const { materialId, quantity } = req.body;
    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: 'Material ID is required',
      });
    }
    const qty = quantity || 1;

    // Check if material exists and is published
    const material = await Material.findByPk(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }
    if (!material.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Material is not available for purchase',
      });
    }

    const cart = await getOrCreateCart(req);

    // Check if the item already exists in the cart
    let cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        materialId,
      },
    });

    if (cartItem) {
      // Update quantity
      cartItem.quantity += qty;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        cartId: cart.id,
        materialId,
        quantity: qty,
        priceAtAddition: material.isFree ? 0 : material.price,
      });
    }

    // Return the updated cart
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'title', 'price', 'isFree', 'thumbnailUrl'],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update a cart item's quantity
 */
export const updateCartItem = async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;
    if (!cartItemId) {
      return res.status(400).json({
        success: false,
        message: 'Cart item ID is required',
      });
    }
    const qty = quantity;
    if (qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const cart = await getOrCreateCart(req);

    const cartItem = await CartItem.findOne({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
      include: [
        {
          model: Material,
          as: 'material',
        },
      ],
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    cartItem.quantity = qty;
    await cartItem.save();

    // Return the updated cart
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'title', 'price', 'isFree', 'thumbnailUrl'],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Remove a cart item
 */
export const removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    if (!cartItemId) {
      return res.status(400).json({
        success: false,
        message: 'Cart item ID is required',
      });
    }

    const cart = await getOrCreateCart(req);

    const deleted = await CartItem.destroy({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    // Return the updated cart
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'title', 'price', 'isFree', 'thumbnailUrl'],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Clear the cart
 */
export const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);

    await CartItem.destroy({
      where: {
        cartId: cart.id,
      },
    });

    // Return the updated cart (empty)
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'title', 'price', 'isFree', 'thumbnailUrl'],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: updatedCart,
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get cart summary (subtotal, taxes, totals)
 */
export const getCartSummary = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);

    // Get cart items with material details for price calculation
    const cartWithItems = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'price', 'isFree'],
            },
          ],
        },
      ],
    });

    let subtotal = 0;
    let taxRate = 0.1; // 10% tax (example)
    let taxAmount = 0;
    let total = 0;

    cartWithItems.items.forEach(item => {
      const itemTotal = item.priceAtAddition * item.quantity;
      subtotal += itemTotal;
    });

    taxAmount = subtotal * taxRate;
    total = subtotal + taxAmount;

    res.status(200).json({
      success: true,
      cartSummary: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        itemCount: cartWithItems.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
};
