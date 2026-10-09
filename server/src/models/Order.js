export default (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    orderNumber: { type: DataTypes.STRING(50), allowNull: false, unique: true, field: 'order_number' },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    taxAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: 'tax_amount' },
    shippingCost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: 'shipping_cost' },
    discountAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: 'discount_amount' },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'total_amount' },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'),
      allowNull: false,
      defaultValue: 'pending',
      field: 'payment_status',
    },
    shippingAddress: { type: DataTypes.JSON, field: 'shipping_address' },
    billingAddress: { type: DataTypes.JSON, field: 'billing_address' },
    notes: { type: DataTypes.TEXT },
    completedAt: { type: DataTypes.DATE, field: 'completed_at' },
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
    Order.hasMany(models.Payment, { foreignKey: 'orderId', as: 'payments' });
  };

  return Order;
};
