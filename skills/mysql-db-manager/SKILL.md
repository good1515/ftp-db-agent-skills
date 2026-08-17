---
name: mysql-db-manager
description: 使用內建 Node.js 腳本連線到 MySQL 或 MariaDB，執行資料庫查詢、資料表檢查、Schema/欄位檢視、資料讀取、資料驗證、SQL 撰寫與受控寫入。當使用者說「查資料庫」、「看資料表」、「確認欄位」、「查後台資料」、「幫我跑 SQL」、「確認這筆資料」、「檢查會員/訂單/文章/分類資料」、「比對資料」、「修正資料庫資料」或 Codex 需要依 `.env` 的 DB_HOST、DB_USER、DB_NAME 等設定讀取/修改 MySQL 資料時使用。優先用 `scripts/execute-query.cjs`，先做 SHOW/DESCRIBE/SELECT/EXPLAIN 等唯讀檢查，只有使用者明確要求才執行 UPDATE/DELETE/INSERT。
---

# MySQL 資料庫管理

優先使用內建腳本，不要重寫資料庫連線程式。

## 使用流程

1. 確認目前執行專案根目錄存在 `.env`，且至少包含 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASS`、`DB_NAME`；不可使用 skill 目錄內的 `.env`。
2. 預設先做唯讀檢查，除非使用者明確要求寫入。
3. 如果不確定資料表或欄位名稱，先查 Schema，不要猜。
4. 從 `scripts/` 目錄執行 `execute-query.cjs`。
5. 執行寫入或破壞性操作前，先說明風險與影響範圍。

常見觸發語意包括：查資料庫、看資料表、跑 SQL、確認欄位、查會員資料、查訂單資料、查文章或分類資料、比對資料、修正資料庫內容。

## 執行指令

在專案根目錄執行：

```bash
node skills/mysql-db-manager/scripts/execute-query.cjs "SHOW TABLES"
node skills/mysql-db-manager/scripts/execute-query.cjs "DESCRIBE users"
node skills/mysql-db-manager/scripts/execute-query.cjs "SELECT * FROM users LIMIT 20"
```

只有在使用者明確要求時才執行寫入：

```bash
node skills/mysql-db-manager/scripts/execute-query.cjs "UPDATE users SET status = 'active' WHERE id = 1"
node skills/mysql-db-manager/scripts/execute-query.cjs "DELETE FROM sessions WHERE expires_at < NOW() LIMIT 100"
```

## 安全規則

- 先用 `SELECT`、`SHOW`、`DESCRIBE`、`EXPLAIN`。
- `UPDATE` 或 `DELETE` 預設必須有明確的 `WHERE` 條件，除非使用者清楚要求批次修改。
- 不要執行 `DROP DATABASE`、`DROP TABLE`、`TRUNCATE` 或其他破壞性 DDL，除非使用者明確確認。
- 探索資料時優先加上 `LIMIT`，避免一次抓太多資料。
- 如果 Schema 不明，先查結構再寫 SQL。

## 檔案說明

- `scripts/execute-query.cjs`: 執行單一 SQL 並輸出 JSON 結果。
- `scripts/db-client.cjs`: 只讀取目前專案根目錄的 `.env` 並建立 MySQL 連線池。
- `assets/.env.example`: `.env` 範例檔。

## 補充

- `execute-query.cjs` 最多只顯示前 50 筆結果。
- 腳本只會從 `process.cwd()`（執行指令時的專案根目錄）尋找 `.env`；找不到時直接停止，不會回退讀取 skill 目錄或範例檔。
- 如果終端輸出出現亂碼，先把相關檔案改成 UTF-8 再繼續調整。
