import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Material = sequelize.define('Material', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 200],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shortDescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
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
      type: DataTypes.STRING,
      allowNull: true,
    },
    gradeLevel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    examYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    materialType: {
      type: DataTypes.ENUM('note', 'video', 'quiz', 'assignment', 'textbook', 'other'),
      allowNull: true,
      defaultValue: 'other',
    },
    // File/image handling
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    previewImages: {
      type: DataTypes.JSON, // Array of image URLs
      allowNull: true,
      defaultValue: [],
    },
    fileAttachments: {
      type: DataTypes.JSON, // Array of file objects {name, url, type, size}
      allowNull: true,
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
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      allowNull: true,
    },
  }, {
    tableName: 'materials',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['title'] },
      { fields: ['subject'] },
      { fields: ['gradeLevel'] },
      { fields: ['examYear'] },
      { fields: ['materialType'] },
      { fields: ['price'] },
    ],
  });

  // Define associations
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
  };

  return Material;
};
