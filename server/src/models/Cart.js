import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      allowNull: true, // Null for guest carts
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true, // For guest carts via session
    },
  }, {
    tableName: 'carts',
    timestamps: true,
    underscored: true,
  });

  // Define associations
  Cart.associate = (models) => {
    Cart.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Cart.hasMany(models.CartItem, {
      foreignKey: 'cartId',
      as: 'items',
    });
  };

  return Cart;
};
