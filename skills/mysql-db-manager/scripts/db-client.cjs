const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function createConnection() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  if (!config.user || !config.password || !config.database) {
    console.error('`.env` 缺少必要的資料庫設定，至少需要 `DB_USER`、`DB_PASS`、`DB_NAME`。');
    process.exit(1);
  }

  try {
    return mysql.createPool(config);
  } catch (error) {
    console.error('建立 MySQL 連線池失敗。');
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { createConnection };
