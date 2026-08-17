const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 一律讀取執行指令時所在專案根目錄的 .env。
// skills/mysql-db-manager/assets/.env.example 僅供參考，禁止作為正式設定來源。
const projectRoot = process.cwd();
const envPath = path.resolve(projectRoot, '.env');

if (!fs.existsSync(envPath)) {
  console.error(`找不到專案設定檔：${envPath}`);
  console.error('請在目前專案根目錄建立 .env；skills/mysql-db-manager/assets/.env.example 僅為範例。');
  process.exit(1);
}

dotenv.config({ path: envPath, override: true });

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
