// Saved-for-later products (table: wishlist_items).
export default (sequelize, DataTypes) => {
  const Wishlist = sequelize.define('Wishlist', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    productId: { type: DataTypes.UUID, allowNull: false },
  }, {
    tableName: 'wishlist_items',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ['user_id', 'product_id'] }],
  });

  Wishlist.associate = (models) => {
    Wishlist.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Wishlist.belongsTo(models.Material, { foreignKey: 'productId', as: 'product' });
  };

  return Wishlist;
};
