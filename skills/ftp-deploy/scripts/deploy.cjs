const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");
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

const defaultIgnores = ".git,node_modules,skills,ftp-deploy,ftp-deploy.skill,package-lock.json,README.md,.env";
const ignoreList = getEnvValue("FTP_IGNORE", defaultIgnores).split(",").map(item => item.trim());

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
            secure,
            secureOptions: {
                rejectUnauthorized: false
            }
        });

        // 嘗試強制開啟 UTF8 支援，這對處理中文檔名至關重要
        try {
            await client.send("OPTS UTF8 ON");
            console.log("已啟用 FTP UTF8 支援");
        } catch (utf8Err) {
            console.warn("[Warning] 伺服器可能不支援 OPTS UTF8 ON，若檔名亂碼請手動確認伺服器編碼設定。");
        }

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
