# 安裝需求
Node.js v19 up

# 建議環境
Plesk
FTP
MySQL/MariaDB
AI: gemini cli / antigravity / codex / cloud code

# 安裝方式
git clone https://github.com/good1515/ftp-db-agent-skills

或 整包下載後 放入專案資料夾

專案:
./skills/

全域:
C:\Users\\[使用者名稱]\\.gemini\antigravity\global_skills\
[僅參考 其他請依AI各自說明放置]

# 使用說明:
複製 .env.example 改名為 .env
填寫 相關連線與部屬設定

# FTP 部署設定
FTP_HOST=ftp.your-domain.com
FTP_USER=your-ftp-username
FTP_PASSWORD='your-ftp-password' # 避免特殊符號錯誤 請保留單引號
FTP_PORT=21
FTP_SECURE=false # Plesk 通常為 true
FTP_REMOTE_DIR=/httpdocs

# MySQL/MariaDB 連線設定
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASS='your_password' # 避免特殊符號錯誤 請保留單引號
DB_NAME=your_database_name

# FTP 執行部署
當您準備好將網站上線時，請告訴我：「幫我部署到 Plesk」或「將網站上傳到 FTP」。

# DB 使用方式
對話中提到 「使用/修改 資料庫」