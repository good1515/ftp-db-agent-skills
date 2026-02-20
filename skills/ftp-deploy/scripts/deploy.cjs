const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

// 優先從 .env 原始檔案中手動提取，以防 dotenv 誤判 # 為註解
const envPath = path.join(process.cwd(), ".env");
let rawEnv = "";
if (fs.existsSync(envPath)) {
    rawEnv = fs.readFileSync(envPath, "utf8");
}

function getEnvValue(key, fallback) {
    const regex = new RegExp(`^${key}=(['"]?)(.*)\\1`, "m");
    const match = rawEnv.match(regex);
    if (match) {
        let val = match[2];
        if (!match[1] && val.includes("#")) {
             const simpleRegex = new RegExp(`^${key}=(.*)`, "m");
             const simpleMatch = rawEnv.match(simpleRegex);
             val = simpleMatch ? simpleMatch[1] : val;
        }
        return val.trim().replace(/^['"]|['"]$/g, '');
    }
    return (process.env[key] || fallback || "").trim();
}

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    const host = getEnvValue("FTP_HOST", "ftp.your-domain.com");
    const user = getEnvValue("FTP_USER", "your-username");
    const password = getEnvValue("FTP_PASSWORD", "");
    const port = parseInt(getEnvValue("FTP_PORT", "21"));
    const secure = getEnvValue("FTP_SECURE", "false") === "true";
    const remoteDir = getEnvValue("FTP_REMOTE_DIR", "/httpdocs");

    console.log(`[Debug] 讀取到的 Host: "${host}"`);
    console.log(`[Debug] 讀取到的 User: "${user}"`);
    console.log(`[Debug] 密碼長度: ${password.length} 個字元`);

    if (!host || !user || !password) {
        console.error("錯誤：請在 .env 檔案中設定 FTP_HOST, FTP_USER, FTP_PASSWORD");
        process.exit(1);
    }

    try {
        console.log(`正在連線至 ${host}:${port}...`);
        await client.access({
            host,
            user,
            password,
            port,
            secure: true,
            secureOptions: {
                rejectUnauthorized: false
            }
        });

        console.log(`連線成功！正在準備上傳至 ${remoteDir}...`);
        
        const ignoreList = [
            ".git",
            "node_modules",
            "skills",
            "ftp-deploy",
            "ftp-deploy.skill",
            "package-lock.json",
            "README.md"
        ];

        await client.uploadFromDir(process.cwd(), remoteDir, (file) => {
            const fileName = path.basename(file);
            if (ignoreList.includes(fileName)) {
                return false;
            }
            if (fileName.startsWith(".") && fileName !== ".htaccess") {
                return false;
            }
            return true;
        });

        console.log("部署完成！");
    } catch (err) {
        console.error("部署失敗：", err);
    } finally {
        client.close();
    }
}

deploy();
