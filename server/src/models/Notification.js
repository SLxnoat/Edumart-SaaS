import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
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
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('orderStatus', 'newMessage', 'system', 'promotion'),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    relatedId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    relatedType: {
      type: DataTypes.ENUM('order', 'material', 'user'),
      allowNull: true,
    },
  }, {
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
  });

  // Define associations
  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Notification.belongsTo(models.Order, {
      foreignKey: 'relatedId',
      as: 'relatedOrder',
      constraints: false,
    });
  };

  return Notification;
};
