// Material == a row in the `products` table (see sql/database_schema.sql).
export default (sequelize, DataTypes) => {
  const Material = sequelize.define('Material', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    sellerId: { type: DataTypes.UUID, allowNull: false },
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true, len: [3, 255] } },
    description: { type: DataTypes.TEXT, allowNull: false },
    shortDescription: { type: DataTypes.STRING(500) },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, validate: { min: 0 } },
    originalPrice: { type: DataTypes.DECIMAL(10, 2) },
    sku: { type: DataTypes.STRING(100), unique: true },
    subject: { type: DataTypes.STRING(100), allowNull: false },
    gradeLevel: { type: DataTypes.STRING(50), allowNull: false },
    examYear: { type: DataTypes.INTEGER },
    productType: {
      type: DataTypes.ENUM('past_paper', 'ebook', 'model_paper', 'revision_notes', 'lecture_pack', 'other'),
      allowNull: false,
      defaultValue: 'other',
    },
    format: { type: DataTypes.ENUM('digital', 'physical', 'both'), allowNull: false, defaultValue: 'digital' },
    isDownloadable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isShippable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    stockQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    ratingAverage: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    ratingCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isFeatured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    isApproved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    thumbnailUrl: { type: DataTypes.STRING(500) },
    viewCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
  });

  Material.associate = (models) => {
    Material.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
    Material.belongsTo(models.User, { foreignKey: 'sellerId', as: 'seller' });
    Material.hasMany(models.CartItem, { foreignKey: 'materialId', as: 'cartItems' });
    Material.hasMany(models.OrderItem, { foreignKey: 'materialId', as: 'orderItems' });
    Material.hasMany(models.Wishlist, { foreignKey: 'productId', as: 'wishlistEntries' });
  };

  return Material;
};
