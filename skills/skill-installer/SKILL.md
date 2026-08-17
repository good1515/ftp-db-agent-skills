---
name: skill-installer
description: 在目前專案安裝 GitHub Agent Skills，並自動處理專案根目錄的 .env 與 .env.example。當使用者說「請安裝 GitHub 網址 到目前專案」或要求安裝 Codex、Claude Code 共用 skills 時使用；安裝後建立待填寫 .env、列出完整路徑並等待設定完成後驗證 FTP 與 DB。
---

# 目前專案 Skill 安裝器

當使用者說：

```text
請安裝 https://github.com/good1515/ftp-db-agent-skills 到目前專案
```

先閱讀來源 Repository 的 README、SKILL.md 與安裝腳本，再優先使用來源 Repository 自己提供的安裝流程；不要使用 Codex 內建的 `.system/skill-installer`，也不要只回覆指令或只安裝到全域目錄。

安裝流程必須：

1. 將目前工作目錄視為專案根目錄。
2. 自動尋找 GitHub Repository 內所有 `SKILL.md`。
3. 安裝到 `<專案根目錄>\skills` 與 `<專案根目錄>\.claude\skills`。
4. 保留現有 `.env.example`；若沒有且來源有範例，複製到專案根目錄。
5. 若專案根目錄沒有 `.env`，立即由 `.env.example` 建立待填寫檔案。
6. 不覆蓋既有 `.env`、`.env.example` 或同名 skill。
7. 安裝完成後立即列出 `.env` 完整絕對路徑與 FTP/DB 欄位。

安裝完成後確認每個 skill 的實際路徑、專案根目錄的 `.env`、`.env.example` 與 `.gitignore` 是否排除 `.env`。

使用者直接提供帳密時，只更新目前專案根目錄 `.env` 的指定欄位，不回顯密碼。使用者說已設定完成後，先驗證 FTP 登入與 DB `SELECT 1`；成功明確回報「FTP 連線成功」與「DB 連線成功」。失敗時先自行修正非敏感的路徑、欄位與格式問題。

所有回覆使用繁體中文；不得將 `.env` 提交或推送到 Git；不得在回覆、日誌或版本說明中顯示密碼。
