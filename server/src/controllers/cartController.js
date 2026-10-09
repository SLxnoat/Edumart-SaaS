import sequelize from '../config/db.js';
import { toProduct } from './catalogController.js';

const { Cart, CartItem, Material, Category } = sequelize.models;

const TAX_RATE = 0.1;
const MAX_QTY = 99;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Cart for the logged-in user, or for the guest session sent in the x-session-id header. */
const getOrCreateCart = async (req) => {
  const userId = req.user?.id;
  const sessionId = req.headers['x-session-id'] || req.body?.sessionId;
  if (userId) {
    const [cart] = await Cart.findOrCreate({ where: { userId }, defaults: { userId } });
    return cart;
  }
  if (sessionId) {
    const [cart] = await Cart.findOrCreate({ where: { sessionId }, defaults: { sessionId } });
    return cart;
  }
  throw new HttpError(400, 'Log in or provide an x-session-id header');
};

// Digital items are bought once; physical items are limited by stock.
const maxQuantity = (m) => (m.format === 'digital' ? 1 : Math.min(MAX_QTY, m.stockQuantity || MAX_QTY));

const serializeCart = async (cart) => {
  const items = await CartItem.findAll({
    where: { cartId: cart.id },
    include: [{
      model: Material,
      as: 'material',
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    }],
    order: [['createdAt', 'ASC']],
  });
  const lines = items.filter((i) => i.material).map((i) => {
    const unitPrice = Number(i.material.price);
    return {
      id: i.id,
      product: toProduct(i.material),
      quantity: i.quantity,
      maxQuantity: maxQuantity(i.material),
      unitPrice,
      lineTotal: Math.round(unitPrice * i.quantity * 100) / 100,
      available: i.material.isActive && i.material.isApproved,
    };
  });
  const subtotal = Math.round(lines.reduce((sum, l) => sum + l.lineTotal, 0) * 100) / 100;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  return {
    id: cart.id,
    items: lines,
    summary: {
      itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal,
      taxRate: TAX_RATE,
      taxAmount: tax,
      total: Math.round((subtotal + tax) * 100) / 100,
    },
  };
};

const handle = (name, fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error(`${name} error:`, error);
    res.status(500).json({ success: false, message: `Failed to ${name}` });
  }
};

const respond = async (res, cart, message) =>
  res.json({ success: true, message, cart: await serializeCart(cart) });

const parseQuantity = (value, fallback) => {
  if (value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new HttpError(400, 'Quantity must be a whole number of at least 1');
  return n;
};

/** GET /api/cart */
export const getCart = handle('get cart', async (req, res) => {
  const cart = await getOrCreateCart(req);
  await respond(res, cart);
});

/** POST /api/cart/add  { productId, quantity? } (materialId accepted as an alias) */
export const addToCart = handle('add item to cart', async (req, res) => {
  const productId = req.body.productId || req.body.materialId;
  if (!productId) throw new HttpError(400, 'productId is required');
  const qty = parseQuantity(req.body.quantity, 1);

  const material = await Material.findByPk(productId);
  if (!material || !material.isActive || !material.isApproved) {
    throw new HttpError(404, 'Product not available');
  }
  if (material.format !== 'digital' && material.stockQuantity < 1) {
    throw new HttpError(400, 'Product is out of stock');
  }

  const cart = await getOrCreateCart(req);
  const existing = await CartItem.findOne({ where: { cartId: cart.id, materialId: productId } });
  const limit = maxQuantity(material);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, limit);
    await existing.save();
  } else {
    await CartItem.create({
      cartId: cart.id,
      materialId: productId,
      quantity: Math.min(qty, limit),
      priceAtAddition: material.price,
    });
  }
  await respond(res, cart, 'Item added to cart');
});

/** PUT /api/cart/item/:cartItemId  { quantity } */
export const updateCartItem = handle('update cart item', async (req, res) => {
  const qty = parseQuantity(req.body.quantity, undefined);
  if (qty === undefined) throw new HttpError(400, 'quantity is required');
  const cart = await getOrCreateCart(req);
  const item = await CartItem.findOne({
    where: { id: req.params.cartItemId, cartId: cart.id },
    include: [{ model: Material, as: 'material' }],
  });
  if (!item) throw new HttpError(404, 'Cart item not found');
  item.quantity = Math.min(qty, item.material ? maxQuantity(item.material) : MAX_QTY);
  await item.save();
  await respond(res, cart, 'Cart item updated');
});

/** DELETE /api/cart/item/:cartItemId */
export const removeFromCart = handle('remove item from cart', async (req, res) => {
  const cart = await getOrCreateCart(req);
  const deleted = await CartItem.destroy({ where: { id: req.params.cartItemId, cartId: cart.id } });
  if (!deleted) throw new HttpError(404, 'Cart item not found');
  await respond(res, cart, 'Item removed from cart');
});

/** DELETE /api/cart/clear */
export const clearCart = handle('clear cart', async (req, res) => {
  const cart = await getOrCreateCart(req);
  await CartItem.destroy({ where: { cartId: cart.id } });
  await respond(res, cart, 'Cart cleared');
});

/** GET /api/cart/summary */
export const getCartSummary = handle('get cart summary', async (req, res) => {
  const cart = await getOrCreateCart(req);
  const { summary } = await serializeCart(cart);
  res.json({ success: true, cartSummary: summary });
});

/** POST /api/cart/merge — move a guest cart (x-session-id) into the logged-in user's cart */
export const mergeGuestCart = handle('merge cart', async (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (!req.user?.id) throw new HttpError(401, 'Authentication required');
  const userCart = await getOrCreateCart({ user: req.user, headers: {}, body: {} });
  const guest = sessionId ? await Cart.findOne({ where: { sessionId } }) : null;
  if (guest) {
    const guestItems = await CartItem.findAll({ where: { cartId: guest.id }, include: [{ model: Material, as: 'material' }] });
    for (const gi of guestItems) {
      if (!gi.material) continue;
      const existing = await CartItem.findOne({ where: { cartId: userCart.id, materialId: gi.materialId } });
      const limit = maxQuantity(gi.material);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + gi.quantity, limit);
        await existing.save();
      } else {
        await CartItem.create({ cartId: userCart.id, materialId: gi.materialId, quantity: Math.min(gi.quantity, limit), priceAtAddition: gi.material.price });
      }
    }
    await guest.destroy();
  }
  await respond(res, userCart, 'Cart merged');
});

export default { getCart, addToCart, updateCartItem, removeFromCart, clearCart, getCartSummary, mergeGuestCart };
