const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error(`找不到專案設定檔：${envPath}`);
  process.exit(1);
}

dotenv.config({ path: envPath, override: true });

async function main() {
  const host = process.env.FTP_HOST;
  const user = process.env.FTP_USER;
  const password = process.env.FTP_PASSWORD;
  const port = Number.parseInt(process.env.FTP_PORT || '21', 10);
  const secure = (process.env.FTP_SECURE || 'false').toLowerCase() === 'true';
  const client = new ftp.Client();
  client.ftp.verbose = false;

  if (!host || !user || !password) {
    console.error('FTP 設定不完整，需要 FTP_HOST、FTP_USER、FTP_PASSWORD。');
    process.exit(1);
  }

  try {
    await client.access({
      host,
      user,
      password,
      port,
      secure,
      secureOptions: { rejectUnauthorized: false },
    });
    console.log('FTP 連線成功');
  } catch (error) {
    console.error(`FTP 連線失敗：${error.message}`);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

main();
