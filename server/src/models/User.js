import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 100],
      },
    },
    role: {
      type: DataTypes.ENUM('student', 'tutor', 'admin'),
      allowNull: false,
      defaultValue: 'student',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verificationToken: {
      type: DataTypes.STRING,
    },
    verificationTokenExpires: {
      type: DataTypes.DATE,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  });

  // Hash password before saving
  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Hash password before updating (if password is changed)
  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Instance method to compare passwords
  User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  // Define associations
  User.associate = (models) => {
    User.hasMany(models.Cart, {
      foreignKey: 'userId',
      as: 'cart',
    });
    User.hasMany(models.Order, {
      foreignKey: 'userId',
      as: 'orders',
    });
    User.hasMany(models.SearchHistory, {
      foreignKey: 'userId',
      as: 'searchHistory',
    });
    User.hasMany(models.SavedSearch, {
      foreignKey: 'userId',
      as: 'savedSearches',
    });
  };

  return User;
};
