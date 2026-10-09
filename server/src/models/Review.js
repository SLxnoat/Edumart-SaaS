export default (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'product_id',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_approved',
    },
  }, {
    tableName: 'reviews',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  });

  // Define associations
  Review.associate = (models) => {
    Review.belongsTo(models.Material, {
      foreignKey: 'productId',
      as: 'material',
    });
    Review.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Review;
};
