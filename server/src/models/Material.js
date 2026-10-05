import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Material = sequelize.define('Material', {
    id: {
      type: DataTypes.INTEGER,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 200],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shortDescription: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    isFree: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // For educational materials
    subject: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    grade_level: {
      type: DataTypes.STRING,
      allowNull: false,
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    exam_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'product_categories',
        key: 'id',
      },
    },
    product_type: {
      type: DataTypes.ENUM("note", "video", "quiz", "assignment", "textbook", "other"),
      allowNull: false,
      defaultValue: 'other',
    },
    // File/image handling
    thumbnailUrl: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    previewImages: {
      type: DataTypes.JSON, // Array of image URLs
      allowNull: false,
      defaultValue: [],
    },
    fileAttachments: {
      type: DataTypes.JSON, // Array of file objects {name, url, type, size}
      allowNull: false,
      defaultValue: [],
    },
    // Status and visibility
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // Moderation
    is_approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    moderationFeedback: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Metadata
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // For tracking
    createdBy: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
      allowNull: false,
    },
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['title'] },
      { fields: ['subject'] },
      { fields: ['grade_level'] },
      { fields: ['exam_year'] },
      { fields: ['product_type'] },
      { fields: ['price'] },
      { fields: ['is_approved'] },
    ],
  });
  Material.associate = (models) => {
    Material.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category',
    });
    Material.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
    });
    Material.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater',
    });
    Material.hasMany(models.CartItem, {
      foreignKey: 'materialId',
      as: 'cartItems',
    });
    Material.hasMany(models.OrderItem, {
      foreignKey: 'materialId',
      as: 'orderItems',
    });
    Material.hasMany(models.Review, {
      foreignKey: 'materialId',
      as: 'reviews',
    });
  };
  return Material;
};
