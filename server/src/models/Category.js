import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
  },
  parentId: {
    type: DataTypes.UUID,
    references: {
      model: 'categories',
      key: 'id',
    },
    allowNull: true, // Null for top-level categories
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0, // 0 for top-level, 1 for subcategory, etc.
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true,
});

// Define self-referential association
Category.associate = (models) => {
  Category.belongsTo(models.Category, {
    as: 'parent',
    foreignKey: 'parentId',
  });
  
  Category.hasMany(models.Category, {
    as: 'subcategories',
    foreignKey: 'parentId',
  });
};

export default Category;
