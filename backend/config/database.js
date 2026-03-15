const { Pool } = require('pg');
require('dotenv').config(); // إضافة هذا السطر لقراءة ملف .env

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'alhiyak',
  password: process.env.DB_PASSWORD || 'Sa@88020401',
  port: process.env.DB_PORT || 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};