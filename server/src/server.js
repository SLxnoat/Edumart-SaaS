import app from './app.js';
import sequelize from './config/db.js';

const PORT = process.env.PORT || 5000;

// Function to synchronize database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // The schema is owned by sql/database_schema.sql (+ sql/migrations).
    // Auto-altering tables from Sequelize models is opt-in: set DB_SYNC=true.
    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync({ alter: true });
      console.log('All models were synchronized successfully.');
    }
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
