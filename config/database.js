const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'keltison_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
async function connect() {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
}

// Close all connections
async function close() {
  try {
    await pool.end();
    console.log('Database connections closed');
  } catch (err) {
    console.error('Error closing database connections:', err);
  }
}

// Query helper
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

// Get client for transactions
async function getClient() {
  return await pool.connect();
}

module.exports = {
  pool,
  query,
  connect,
  close,
  getClient
};
