import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.CHAR(36),
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Notification',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      field: 'is_read',
      allowNull: false,
      defaultValue: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'general',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'notifications',
    timestamps: false,
  });

  // Define associations
  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Notification;
};
