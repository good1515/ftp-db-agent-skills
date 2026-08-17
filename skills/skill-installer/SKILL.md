---
name: project-skill-installer
description: 將 GitHub Repository 內的 Agent Skills 安裝到目前專案，支援 Codex 的 skills 與 Claude Code 的 .claude/skills，並處理專案根目錄的 .env、.env.example 與 .gitignore。當使用者要求把 GitHub skills 安裝到目前專案、指定 Codex/Claude Code 平台，或需要安裝後檢查與 FTP/DB 設定驗證時使用。
---

# 專案 Skill 安裝器

## 適用指令

處理例如：

```text
請安裝 https://github.com/good1515/ftp-db-agent-skills 到目前專案
```

將目前工作目錄視為專案根目錄。預設同時安裝到：

- Codex：`<專案根目錄>/skills/<skill-name>`
- Claude Code：`<專案根目錄>/.claude/skills/<skill-name>`

使用者明確指定平台時，只安裝到指定平台。不要安裝到全域 `~/.codex/skills` 或 `~/.claude/skills`，除非使用者明確要求。

## 安裝流程

1. 先閱讀來源 Repository 的 `README`、所有相關 `SKILL.md` 與安裝腳本，優先使用來源 Repository 提供的安裝流程；不要使用 Codex 內建的 `.system/skill-installer`。
2. 使用來源 Repository 的安裝腳本下載指定的 GitHub Repository。未指定版本時使用 `main`；只接受 `https://github.com/<owner>/<repo>` Repository 根網址。
3. 讓腳本在暫存目錄中處理下載內容，完成或失敗後清理暫存檔，不把暫存內容留在目前專案內。
4. 自動尋找包含 `SKILL.md` 的 skill：Repository 根目錄有 `SKILL.md` 時視為單一 skill，否則搜尋子目錄；排除 `.git`、`node_modules`、`__pycache__`、`.venv`、`dist` 與 `build`。
5. 只複製 skill 目錄，不把整個 Repository 當成 skill。依 `SKILL.md` frontmatter 的 `name` 決定目標目錄；拒絕不符合小寫英數字與連字號規則的名稱。
6. 目標已有同名 skill 時跳過該平台的該項目，不覆蓋、刪除或合併既有內容。
7. 若專案根目錄沒有 `.env.example`，且來源 Repository 根目錄有 `.env.example`，複製一份補上；若已有則保留，不覆蓋。
8. 若專案根目錄沒有 `.env`，以專案根目錄的 `.env.example` 建立待填寫檔案；若已有則保留，不覆蓋。不要複製來源 Repository 的真實 `.env`。
9. 安裝失敗、找不到 `SKILL.md` 或驗證失敗時停止，使用繁體中文說明原因，不要假裝安裝成功。

如果來源 Repository 沒有根目錄 `.env.example`，且目前專案也沒有 `.env.example`，不要自行產生含真實設定的檔案；說明未建立 `.env` 的原因。

## 安裝後檢查與回報

完成安裝後，先用繁體中文列出：

- 目前專案根目錄的完整絕對路徑
- `.env` 的完整絕對路徑
- 每個已安裝 skill 的實際絕對路徑
- 已跳過的同名 skill 與原因
- `.env`、`.env.example` 是否存在
- `.gitignore` 是否排除 `.env`

若 `.gitignore` 尚未排除 `.env`，在不影響既有規則的前提下補上；不要將 `.env` 加入 Git、提交或推送。安裝後可使用環境提供的 `quick_validate.py` 檢查各 skill 的 frontmatter 與名稱；沒有該工具時，至少人工確認 `SKILL.md` 與 Codex 專用的 `agents/openai.yaml`（若存在）。

立即提醒使用者編輯專案根目錄的 `.env`，只列出欄位名稱，不顯示或要求貼出設定值：

- FTP：`FTP_HOST`、`FTP_USER`、`FTP_PASSWORD`、`FTP_PORT`、`FTP_SECURE`、`FTP_REMOTE_DIR`
- MySQL/MariaDB：`DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASS`、`DB_NAME`

不要求使用者執行 Python 安裝指令；安裝器內部可使用 Python 腳本，但對使用者只提供自然語言操作方式。

## 設定完成後的連線驗證

使用者回覆「已設定好」或相近意思後，優先執行唯讀驗證：

- FTP：只驗證登入，不上傳或修改遠端檔案；成功時回報 `FTP 連線成功`。
- DB：只執行 `SELECT 1`，不修改資料；成功時回報 `DB 連線成功`。

失敗時先自行檢查並修正安全且非敏感的問題，例如 `.env` 完整路徑、欄位名稱、前後空白、引號、連接埠、數字格式、布林值與非敏感預設值。帳號密碼錯誤、主機拒絕連線或需要外部權限時，再請使用者確認。回報只顯示成功/失敗與脫敏錯誤，不顯示密碼、完整連線字串或其他機密環境變數。

如果使用者直接提供 FTP 或 DB 設定值，只將明確提供的欄位寫入目前專案根目錄的 `.env`；`.env` 不存在時可依 `.env.example` 建立，但必須保留 `.env.example`。寫入前後確認 `.gitignore` 排除 `.env`，寫入後立即執行相同連線驗證；不要回顯密碼。

## 安全規則

- 只處理使用者指定的 GitHub Repository 與目前專案，不擴大安裝範圍。
- 防止壓縮檔路徑穿越；只使用 Repository 內的相對路徑。
- 不讀取、不提交、不顯示 `.env`、金鑰、權杖或其他機密檔案內容。
- 不覆蓋、刪除或清空既有 skill、`.env` 或 `.env.example`。
- 所有回覆、錯誤說明與版本資訊使用繁體中文。
