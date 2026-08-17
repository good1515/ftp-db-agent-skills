# FTP DB Agent Skills

提供網站開發、FTP 部署、MySQL/MariaDB 管理，以及 Codex 與 Claude Code 共用的 Agent Skills。

## 使用需求

- Node.js 18 以上
- Git
- PHP 網站主機、FTP/FTPS 與 MySQL/MariaDB（依實際使用的 skill 決定）
- 支援 Codex、Claude Code、Gemini CLI 等 AI 工具

## 安裝到目前專案

請對 AI 說：

```text
請安裝 https://github.com/good1515/ftp-db-agent-skills 到目前專案
```

AI 會在內部先閱讀 Repository 文件，再使用 Repository 自己提供的安裝流程，不得只安裝到全域目錄。

完成後確認技能安裝到：

```text
Codex：       <專案根目錄>\skills\<skill-name>
Claude Code： <專案根目錄>\.claude\skills\<skill-name>
```

兩個平台共用同一份 `SKILL.md`。Codex 專用的 `agents/openai.yaml` 可以保留，Claude Code 會忽略不需要的額外 metadata。已存在的同名 skill 會跳過，不會覆蓋或刪除。

安裝後確認：

- 技能實際安裝路徑
- 專案根目錄的 `.env`
- 專案根目錄的 `.env.example`
- `.gitignore` 是否排除 `.env`

安裝完成後，AI 會立即列出目前專案 `.env` 的完整絕對路徑，例如：

```text
D:\your-project\.env
```

`.env.example` 必須保留，僅作為設定範例；正式帳密填入同一個專案根目錄的 `.env`。

如果目前專案缺少 `.env.example`，安裝器會嘗試從 GitHub Repository 根目錄補上；如果目前專案缺少 `.env`，會以 `.env.example` 建立一份待填寫的 `.env`。既有 `.env` 與 `.env.example` 都不會被覆蓋，來源 Repository 的真實 `.env` 也不會被複製。

## `.env` 設定

FTP 設定：

```.env
FTP_HOST=ftp.your-domain.com
FTP_USER=your-ftp-username
FTP_PASSWORD='your-ftp-password'
FTP_PORT=21
FTP_SECURE=false
FTP_REMOTE_DIR=/httpdocs
```

MySQL/MariaDB 設定：

```.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASS='your_password'
DB_NAME=your_database_name
```

如果使用者直接提供 FTP 或 DB 帳號密碼，AI 可以協助寫入目前專案的 `.env`，只更新指定欄位，不回顯密碼，也不會刪除或覆蓋 `.env.example`。

## 設定完成後的連線驗證

使用者回覆「已設定好」後，AI 會優先驗證：

- FTP：只執行登入驗證，不上傳檔案
- DB：只執行 `SELECT 1`，不修改資料

成功時會明確回報：

```text
FTP 連線成功
DB 連線成功
```

失敗時會先自行檢查並修正可安全處理的問題，例如 `.env` 路徑、欄位名稱、前後空白、引號、連接埠與布林值格式。帳號密碼錯誤、主機拒絕連線或需要外部權限時，才會請使用者確認。

## FTP 部署

準備上線時，對 AI 說：

```text
幫我部署到 Plesk
```

或：

```text
將網站上傳到 FTP
```

部署前會依 `.env` 的 FTP 設定執行，並遵循既有忽略清單。

## 資料庫操作

需要查詢或修改資料庫時，對 AI 說明需求，例如：

```text
查詢資料庫的 users 資料表
```

```text
確認這筆訂單資料
```

預設先進行 `SHOW`、`DESCRIBE`、`SELECT` 或 `EXPLAIN` 等唯讀檢查；只有使用者明確要求才執行資料寫入。

## 安全注意事項

- `.env` 只放在目前專案根目錄，不使用 skill 目錄內的 `.env`。
- `.env.example` 只放欄位範例，不放真實密碼。
- 不要將 `.env` 提交或推送到 Git。
- AI 的回覆與版本說明一律使用繁體中文。
- 不需要使用者執行 Python 安裝指令；直接使用上述一句話即可。
