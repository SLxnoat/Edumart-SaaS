import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const ChatbotInteraction = sequelize.define('ChatbotInteraction', {
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
      allowNull: true, // nullable for guest users
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    intent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    confidenceScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    isHelpful: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  }, {
    tableName: 'chatbot_interactions',
    timestamps: true,
    underscored: true,
  });

  // Define associations
  ChatbotInteraction.associate = (models) => {
    ChatbotInteraction.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return ChatbotInteraction;
};
