require('dotenv').config(); // always load env locally

const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function init() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }

    const sql = fs.readFileSync(
      path.join(__dirname, 'init.sql'),
      'utf8'
    );

    await pool.query(sql);

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Initialization failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

init();