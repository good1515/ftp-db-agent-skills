---
name: mysql-db-manager
description: 使用內建 Node.js 腳本連線到 MySQL 或 MariaDB，執行資料表檢查、Schema 檢視、查詢驗證與受控 SQL 操作。當 Codex 需要查看資料表、讀取資料、確認欄位結構、撰寫或執行 SQL，且資料庫連線資訊放在 `.env` 時使用此 skill。
---

# MySQL 資料庫管理

優先使用內建腳本，不要重寫資料庫連線程式。

## 使用流程

1. 確認 skill 根目錄存在 `.env`，且至少包含 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASS`、`DB_NAME`。
2. 預設先做唯讀檢查，除非使用者明確要求寫入。
3. 如果不確定資料表或欄位名稱，先查 Schema，不要猜。
4. 從 `scripts/` 目錄執行 `execute-query.cjs`。
5. 執行寫入或破壞性操作前，先說明風險與影響範圍。

## 執行指令

在 `skills/mysql-db-manager/scripts/` 目錄執行：

```bash
node execute-query.cjs "SHOW TABLES"
node execute-query.cjs "DESCRIBE users"
node execute-query.cjs "SELECT * FROM users LIMIT 20"
```

只有在使用者明確要求時才執行寫入：

```bash
node execute-query.cjs "UPDATE users SET status = 'active' WHERE id = 1"
node execute-query.cjs "DELETE FROM sessions WHERE expires_at < NOW() LIMIT 100"
```

## 安全規則

- 先用 `SELECT`、`SHOW`、`DESCRIBE`、`EXPLAIN`。
- `UPDATE` 或 `DELETE` 預設必須有明確的 `WHERE` 條件，除非使用者清楚要求批次修改。
- 不要執行 `DROP DATABASE`、`DROP TABLE`、`TRUNCATE` 或其他破壞性 DDL，除非使用者明確確認。
- 探索資料時優先加上 `LIMIT`，避免一次抓太多資料。
- 如果 Schema 不明，先查結構再寫 SQL。

## 檔案說明

- `scripts/execute-query.cjs`: 執行單一 SQL 並輸出 JSON 結果。
- `scripts/db-client.cjs`: 讀取 `.env` 並建立 MySQL 連線池。
- `assets/.env.example`: `.env` 範例檔。

## 補充

- `execute-query.cjs` 最多只顯示前 50 筆結果。
- 腳本會從 `scripts/` 的上一層尋找 `.env`。
- 如果終端輸出出現亂碼，先把相關檔案改成 UTF-8 再繼續調整。
