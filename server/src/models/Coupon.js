import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isUppercase: true,
      },
    },
    discountType: {
      type: DataTypes.ENUM('percentage', 'fixed_amount'),
      allowNull: false,
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    minPurchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    maxDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'coupons',
    timestamps: true,
    underscored: true,
  });

  return Coupon;
};
