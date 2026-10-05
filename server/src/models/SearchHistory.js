import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const SearchHistory = sequelize.define('SearchHistory', {
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
  }, {
    tableName: 'search_histories',
    timestamps: true,
    underscored: true,
  });

  // Define associations
  SearchHistory.associate = (models) => {
    SearchHistory.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return SearchHistory;
};
