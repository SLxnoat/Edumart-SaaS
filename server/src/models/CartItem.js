import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    priceAtAddition: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    materialId: {
      type: DataTypes.UUID,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id',
      },
      allowNull: false,
    },
  }, {
    tableName: 'cart_items',
    timestamps: true,
    underscored: true,
  });

  // Define associations
  CartItem.associate = (models) => {
    CartItem.belongsTo(models.Cart, {
      foreignKey: 'cartId',
      as: 'cart',
    });
    CartItem.belongsTo(models.Material, {
      foreignKey: 'materialId',
      as: 'material',
    });
  };

  return CartItem;
};
