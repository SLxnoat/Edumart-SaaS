export default (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: { type: DataTypes.UUID, allowNull: false, field: 'order_id' },
    paymentMethod: { type: DataTypes.STRING(100), field: 'payment_method' },
    gatewayReference: { type: DataTypes.STRING(255), field: 'gateway_reference' },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'paid', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paidAt: { type: DataTypes.DATE, field: 'paid_at' },
  }, {
    tableName: 'payments',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  };

  return Payment;
};
