import sequelize from '../config/db.js';
import { toProduct } from './catalogController.js';

const { Wishlist, Material, Category } = sequelize.models;

const productInclude = {
  model: Material,
  as: 'product',
  include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
};

/** GET /api/wishlist */
export const getWishlist = async (req, res) => {
  try {
    const rows = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [productInclude],
      order: [['createdAt', 'DESC']],
    });
    res.json({
      success: true,
      items: rows.filter((r) => r.product).map((r) => ({
        id: r.id,
        product: toProduct(r.product),
        addedAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
  }
};

/** POST /api/wishlist  { productId } — idempotent */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });
    const product = await Material.findByPk(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const [item, created] = await Wishlist.findOrCreate({
      where: { userId: req.user.id, productId },
      defaults: { userId: req.user.id, productId },
    });
    res.status(created ? 201 : 200).json({ success: true, item: { id: item.id, productId }, created });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
  }
};

/** DELETE /api/wishlist/:id — id is the wishlist item id or the product id */
export const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await Wishlist.findAll({ where: { userId: req.user.id } });
    const target = rows.find((r) => r.id === id || r.productId === id);
    if (!target) return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    await target.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
  }
};

/** DELETE /api/wishlist */
export const clearWishlist = async (req, res) => {
  try {
    await Wishlist.destroy({ where: { userId: req.user.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear wishlist' });
  }
};
