const { createConnection } = require('./db-client.cjs');
const { execSync } = require("child_process");

// 強制設定輸出編碼為 UTF-8
if (process.stdout.isTTY) {
  process.stdout.setEncoding('utf8');
}

// 針對 Windows 環境進行編碼優化
if (process.platform === "win32") {
  try {
    // 設定編碼為 UTF-8 (65001)
    execSync("chcp 65001", { stdio: "ignore" });
  } catch (e) {
    // 忽略錯誤
  }
}

async function main() {
  const sql = process.argv[2];
  
  if (!sql) {
    console.error('請提供 SQL 指令。例如: node execute-query.cjs "SELECT * FROM users LIMIT 5"');
    process.exit(1);
  }

  const pool = await createConnection();
  
  try {
    const [rows, fields] = await pool.execute(sql);
    
    // 如果是 SELECT 語句，通常回傳結果陣列
    if (Array.isArray(rows)) {
      if (rows.length === 0) {
        console.log('查詢成功：沒有符合條件的資料。');
      } else {
        const count = rows.length;
        const limit = 50;
        const results = rows.slice(0, limit);
        
        console.log(`查詢成功：共找到 ${count} 筆資料 (顯示前 ${results.length} 筆)：`);
        console.log(JSON.stringify(results, null, 2));
        
        if (count > limit) {
          console.log(`
(還有 ${count - limit} 筆資料未顯示，請使用 LIMIT 或 OFFSET 進行分頁查詢)`);
        }
      }
    } else {
      // 如果是 INSERT/UPDATE/DELETE，通常回傳一個 ResultSetHeader 物件
      console.log('執行成功：');
      console.log(JSON.stringify(rows, null, 2));
    }
  } catch (error) {
    console.error('執行 SQL 時發生錯誤：');
    console.error(error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
