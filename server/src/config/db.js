import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Material from '../models/Material.js';
import SearchHistory from '../models/SearchHistory.js';
import SavedSearch from '../models/SavedSearch.js';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'edumart',
  process.env.DB_USER || 'edumart_user',
  process.env.DB_PASSWORD || 'edumart_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

// Initialize models
const modelDefiners = [User, Category, Material, SearchHistory, SavedSearch];

// Run init functions on all models
for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

// Execute synchronization
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models
    await sequelize.sync({ alter: true }); // Use alter: true for development, false for production
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export { sequelize, syncDatabase };
export default sequelize;
