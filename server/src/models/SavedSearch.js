import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const SavedSearch = sequelize.define('SavedSearch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  query: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
}, {
  tableName: 'saved_searches',
  timestamps: true,
  underscored: true,
});

// Define associations
SavedSearch.associate = (models) => {
  SavedSearch.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
};

export default SavedSearch;
