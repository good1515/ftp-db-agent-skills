const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// 讀取該技能目錄下的 .env 檔案
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function createConnection() {
  try {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      charset: 'utf8mb4', // 強制使用 UTF-8 編碼
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    if (!config.user || !config.password || !config.database) {
      throw new Error('未在 .env 檔案中提供資料庫連線資訊。請確認已正確填寫 DB_USER, DB_PASS, DB_NAME。');
    }

    const pool = mysql.createPool(config);
    return pool;
  } catch (error) {
    console.error('資料庫失敗:', error.message);
    process.exit(1);
  }
}

module.exports = { createConnection };
