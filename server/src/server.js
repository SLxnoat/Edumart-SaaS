import app from './app.js';
import sequelize from './config/db.js';

const PORT = process.env.PORT || 5000;

// Function to synchronize database
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

async function startServer() {
  try {
    // Only sync the database if we are not in test environment
    if (process.env.NODE_ENV !== 'test') {
      await syncDatabase();
    }
    
    app.listen(PORT, () => {
      console.log(`EduMart server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();
