---
name: mysql-db-manager
description: 用於連接與操作 MySQL 或 MariaDB 資料庫。支援執行 SQL 查詢 (CRUD)、查看資料表結構及數據分析。適用於需要進行資料持久化或管理現有資料庫的任務。
---

# MySQL 資料庫管理工具 (MySQL DB Manager)

此技能讓 AI 能夠直接與您的 MySQL 或 MariaDB 資料庫互動。透過執行 SQL 指令，AI 可以讀取、寫入、修改或刪除資料，並協助您分析數據或調整資料庫結構。

## 快速開始

在使用此技能前，請確保已在技能目錄下的 `scripts/` 中安裝了必要套件 (`mysql2`, `dotenv`)，並且已正確設定環境變數。

### 1. 設定連線資訊
請在 `skills/mysql-db-manager/` 目錄下建立 `.env` 檔案（可參考 `assets/.env.example`）：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=您的帳號
DB_PASS=您的密碼
DB_NAME=您的資料庫名稱
```

### 2. 核心功能與指令

AI 應透過 `run_shell_command` 在 `skills/mysql-db-manager/scripts/` 目錄下執行以下指令：

- **執行 SQL 查詢**:
  ```bash
  node execute-query.cjs "SELECT * FROM users LIMIT 5"
  ```
- **查看資料表結構**:
  ```bash
  node execute-query.cjs "DESCRIBE users"
  ```
- **更新資料**:
  ```bash
  node execute-query.cjs "UPDATE users SET status = 'active' WHERE id = 1"
  ```

## 安全規範 (重要)

為了確保資料安全，AI 在操作資料庫時必須遵循以下原則：

1. **先查詢，後操作**: 在執行 `UPDATE` 或 `DELETE` 之前，必須先執行 `SELECT` 確認目標資料是否存在且符合預期。
2. **嚴格條件**: 除非使用者明確要求，否則禁止執行不帶 `WHERE` 子句的 `UPDATE` 或 `DELETE`。
3. **分頁查詢**: 對於大型資料表，一律加上 `LIMIT` 以避免過大的結果集導致記憶體溢出。本工具預設僅顯示前 50 筆。
4. **禁止毀滅性指令**: 禁止執行 `DROP DATABASE` 或 `DROP TABLE`，除非使用者在當前對話中給予明確且重複的確認。
5. **備份建議**: 在執行大規模修改前，建議提醒使用者先備份資料庫。

## 常用操作範例

- **查詢所有資料表**: `node execute-query.cjs "SHOW TABLES"`
- **建立新資料表**: `node execute-query.cjs "CREATE TABLE test (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100))"`
- **插入資料**: `node execute-query.cjs "INSERT INTO users (username, email) VALUES ('testuser', 'test@example.com')"`

## 注意事項 (編碼處理)

- **中文字元支援**:
  - 本技能已在連線配置中強制使用 `charset: 'utf8mb4'`，並在 Windows 環境下自動執行 `chcp 65001` 以支援 UTF-8。
  - **Gemini CLI 自動執行時**: 若在對話視窗中看到資料庫內容顯示為亂碼，建議在 PowerShell 執行：
    ```powershell
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    ```
  - **資料庫編碼**: 請確保您的資料庫與資料表本身也設定為 `utf8mb4_unicode_ci` 或 `utf8_general_ci` 以獲得最佳相容性。

## 資源結構

- `scripts/execute-query.cjs`: 主要執行入口，負責 SQL 執行與格式化輸出。
- `scripts/db-client.cjs`: 底層連線邏輯，管理連線池。
- `assets/.env.example`: 環境變數範本。
