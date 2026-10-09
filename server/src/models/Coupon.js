export default (sequelize, DataTypes) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    discountType: {
      type: DataTypes.ENUM('percentage', 'fixed_amount'),
      defaultValue: 'percentage',
      field: 'discount_type',
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'discount_value',
    },
    minOrderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'min_order_amount',
    },
    validFrom: {
      type: DataTypes.DATE,
      field: 'valid_from',
    },
    validTo: {
      type: DataTypes.DATE,
      field: 'valid_to',
    },
    maxUses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'max_uses',
    },
    createdBy: {
      type: DataTypes.UUID,
      field: 'created_by',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'coupons',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  });

  Coupon.associate = (models) => {
    Coupon.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  };

  return Coupon;
};
