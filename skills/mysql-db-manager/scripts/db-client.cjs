const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// 優先讀取該技能目錄下的 .env 檔案，若不存在則嘗試讀取專案根目錄
const skillEnvPath = path.resolve(__dirname, '../.env');
const rootEnvPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: skillEnvPath });
dotenv.config({ path: rootEnvPath });

async function createConnection(envType = 'MAIN') {
  try {
    const suffix = envType.toUpperCase();
    const config = {
      host: process.env[`DB_${suffix}_HOST`] || 'localhost',
      port: parseInt(process.env[`DB_${suffix}_PORT`] || '3306'),
      user: process.env[`DB_${suffix}_USER`],
      password: process.env[`DB_${suffix}_PASS`],
      database: process.env[`DB_${suffix}_NAME`],
      charset: 'utf8mb4', // 強制使用 UTF-8 編碼
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    if (!config.user || !config.password || !config.database) {
      throw new Error(`環境 ${suffix} 的設定不完整或該環境不存在。請確認 .env 檔案中已填寫 DB_${suffix}_USER, DB_${suffix}_PASS, DB_${suffix}_NAME。`);
    }

    const pool = mysql.createPool(config);
    return pool;
  } catch (error) {
    console.error(`資料庫 (${envType}) 失敗:`, error.message);
    process.exit(1);
  }
}

module.exports = { createConnection };
