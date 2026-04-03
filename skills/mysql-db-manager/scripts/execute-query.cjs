const { createConnection } = require('./db-client.cjs');

async function main() {
  const sql = process.argv[2]?.trim();

  if (!sql) {
    console.error('請提供 SQL，例如：node execute-query.cjs "SELECT * FROM users LIMIT 5"');
    process.exit(1);
  }

  const pool = await createConnection();

  try {
    const [rows] = await pool.execute(sql);

    if (Array.isArray(rows)) {
      if (rows.length === 0) {
        console.log('查詢成功，沒有回傳資料列。');
      } else {
        const totalRows = rows.length;
        const displayLimit = 50;
        const displayedRows = rows.slice(0, displayLimit);

        console.log(`查詢成功，共 ${totalRows} 筆，顯示 ${displayedRows.length} 筆。`);
        console.log(JSON.stringify(displayedRows, null, 2));

        if (totalRows > displayLimit) {
          console.log(`輸出已截斷，還有 ${totalRows - displayLimit} 筆未顯示。`);
        }
      }
    } else {
      console.log('SQL 執行成功。');
      console.log(JSON.stringify(rows, null, 2));
    }
  } catch (error) {
    console.error('SQL 執行失敗。');
    console.error(error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
