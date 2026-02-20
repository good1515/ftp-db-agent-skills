使用說明:
複製 .env.example 改名為 .env
填寫 相關連線與部屬設定

# FTP 部署設定
FTP_HOST=ftp.your-domain.com
FTP_USER=your-ftp-username
FTP_PASSWORD='your-ftp-password' # 避免特殊符號錯誤 請保留單引號
FTP_PORT=21
FTP_SECURE=false
FTP_REMOTE_DIR=/httpdocs

# MySQL/MariaDB 連線設定
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASS='your_password' # 避免特殊符號錯誤 請保留單引號
DB_NAME=your_database_name
