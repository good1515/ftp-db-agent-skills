const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

// 針對 Windows CMD 執行 chcp 65001 以支援 UTF-8 輸出
if (process.platform === "win32") {
    try {
        execSync("chcp 65001", { stdio: "inherit" });
    } catch (e) {
        // 忽略錯誤，可能是因為環境限制
    }
}

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

const ignoreList = [
    ".git",
    "node_modules",
    "skills",
    "ftp-deploy",
    "ftp-deploy.skill",
    "package-lock.json",
    "README.md",
    ".env",
    "migrate.php"
];

function shouldIgnore(fileOrDirName, isFile = true) {
    if (ignoreList.includes(fileOrDirName)) return true;
    if (fileOrDirName.startsWith(".") && fileOrDirName !== ".htaccess") return true;
    return false;
}

async function uploadDirRecursive(client, localDirPath, remoteDirPath) {
    const items = fs.readdirSync(localDirPath);
    
    for (const item of items) {
        const localPath = path.join(localDirPath, item);
        const remotePath = remoteDirPath + "/" + item;
        const stats = fs.statSync(localPath);
        
        if (shouldIgnore(item, stats.isFile())) {
            console.log(`[Ignore] ${item}`);
            continue;
        }
        
        if (stats.isDirectory()) {
            console.log(`[Dir] 進入目錄: ${item}`);
            await client.ensureDir(remotePath);
            await uploadDirRecursive(client, localPath, remotePath);
            // 回到上一層
            await client.cd(remoteDirPath);
        } else {
            console.log(`[Upload] 上傳檔案: ${item}`);
            await client.uploadFrom(localPath, item);
        }
    }
}

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = false; // 關閉 verbose 以免輸出過多

    const host = getEnvValue("FTP_HOST", "ftp.your-domain.com");
    const user = getEnvValue("FTP_USER", "your-username");
    const password = getEnvValue("FTP_PASSWORD", "");
    const port = parseInt(getEnvValue("FTP_PORT", "21"));
    const secure = getEnvValue("FTP_SECURE", "false") === "true";
    const remoteDir = getEnvValue("FTP_REMOTE_DIR", "/httpdocs");

    console.log(`[Debug] 讀取到的 Host: "${host}"`);
    console.log(`[Debug] 讀取到的 User: "${user}"`);

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

        console.log(`連線成功！正在切換至遠端目錄 ${remoteDir}...`);
        await client.ensureDir(remoteDir);
        await client.cd(remoteDir);
        
        console.log("開始遞迴上傳 (已套用過濾邏輯)...");
        await uploadDirRecursive(client, process.cwd(), remoteDir);

        console.log("部署完成！");
    } catch (err) {
        console.error("部署失敗：", err);
    } finally {
        client.close();
    }
}

deploy();
