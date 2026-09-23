require('dotenv').config();
const app = require('./src/app');
const { ensureDatabaseExists } = require('./src/config/database');
const { runMigrations } = require('./src/database/migrations');
const { runSeeds } = require('./src/database/seeds');

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // 1. Ensure DB exists in PostgreSQL
    await ensureDatabaseExists();

    // 2. Run schema migrations
    await runMigrations();

    // 3. Seed demo data
    await runSeeds();

    // 4. Start HTTP listener
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 BuyLog API Server is running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🐘 Database: PostgreSQL (${process.env.DB_NAME || 'buylog_db'})`);
      console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('Fatal error starting BuyLog API server:', error);
    process.exit(1);
  }
}

startServer();
