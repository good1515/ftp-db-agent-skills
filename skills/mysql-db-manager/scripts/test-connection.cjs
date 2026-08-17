const { createConnection } = require('./db-client.cjs');

async function main() {
  const pool = await createConnection();
  try {
    await pool.query('SELECT 1');
    console.log('DB 連線成功');
  } catch (error) {
    console.error(`DB 連線失敗：${error.message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`DB 連線失敗：${error.message}`);
  process.exit(1);
});
