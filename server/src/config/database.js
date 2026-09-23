const { Pool, Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

let dbConfig;
if (connectionString) {
  dbConfig = {
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Supabase / cloud PostgreSQL
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  };
} else {
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || 'boscod21'),
    database: process.env.DB_NAME || 'buylog_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
}

// Function to auto-create database if on local instance
async function ensureDatabaseExists() {
  if (connectionString) return; // Supabase already provisions database

  const targetDb = dbConfig.database;
  const adminClient = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    const res = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb]
    );

    if (res.rowCount === 0) {
      console.log(`Database "${targetDb}" does not exist. Creating...`);
      await adminClient.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`Database "${targetDb}" created successfully.`);
    }
  } catch (err) {
    console.warn(`Note when checking database: ${err.message}`);
  } finally {
    try {
      await adminClient.end();
    } catch (_) {}
  }
}

const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
  ensureDatabaseExists
};
