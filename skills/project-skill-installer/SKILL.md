---
name: project-skill-installer
description: 將 GitHub 上的 Agent Skills 安裝到目前專案，支援 Codex 的 skills 資料夾與 Claude Code 的 .claude/skills 資料夾。當使用者說「請安裝 GitHub 網址 到目前專案」、要自動辨識一個或多個 SKILL.md、避免覆蓋既有 skill，或需要安裝後驗證時使用。
---

# 專案 Skill 安裝器

## 目的

處理下列自然語言指令：

```text
請安裝 https://github.com/good1515/ftp-db-agent-skills 到目前專案
```

將目前執行目錄視為專案根目錄，並把 GitHub Repository 內辨識到的 skill 安裝至 Codex 的 `目前專案/skills/<skill-name>` 與 Claude Code 的 `目前專案/.claude/skills/<skill-name>`。預設兩個平台都安裝；使用者指定平台時才安裝單一平台。不要直接修改全域 `~/.codex/skills` 或 `~/.claude/skills`，除非使用者明確要求全域安裝。

## 執行流程

1. 解析 GitHub Repository URL；未指定版本時使用 `main`。
2. 將 Repository 下載至暫存目錄，不把暫存內容留在專案內。
3. 自動尋找包含 `SKILL.md` 的 skill：Repository 根目錄有 `SKILL.md` 時視為單一 skill；否則檢查其子目錄，排除 `.git`、`node_modules`、暫存與建置目錄。
4. 將每個 skill 安裝至目前專案的 `skills/<skill-name>`。
5. 若目標目錄已存在，跳過該平台的該項安裝並提示，不覆蓋、不刪除、不合併既有內容。
6. 安裝後檢查 `SKILL.md` 的 frontmatter 與 skill 名稱；可用時執行 `quick_validate.py`。
7. 安裝完成後，第一時間用繁體中文列出目前專案根目錄與 `.env` 的完整絕對路徑，並通知使用者編輯該檔案及填入 FTP 與資料庫設定欄位。
8. 再回報安裝結果、實際路徑、驗證結果與跳過項目；不要要求使用者把帳號密碼貼到對話中。
9. 使用者回覆「已設定好」或相近意思後，優先執行 FTP 與 DB 連線驗證；成功時分別回報「FTP 連線成功」與「DB 連線成功」。
10. 連線失敗時，先自行檢查並修正可安全處理的問題，例如 `.env` 完整路徑、欄位拼寫、前後空白、引號、數字格式、布林值格式與非敏感預設值；不要猜測、替換或顯示帳號密碼。
11. 如果使用者直接提供 FTP 或 DB 帳號密碼，將使用者明確提供的值寫入目前專案完整路徑的 `.env`，只更新對應欄位；`.env` 不存在時可依 `.env.example` 建立，但必須保留 `.env.example`。
12. 寫入帳號密碼後立即執行 FTP 與 DB 連線驗證；回覆只能顯示成功/失敗與脫敏錯誤，不得回顯密碼、完整連線字串或機密環境變數。
13. 寫入前後檢查 `.gitignore` 是否排除 `.env`；不要把 `.env` 加入 Git、提交或推送。若未排除，先提醒並在不影響其他規則的前提下補上 `.env` 排除規則。

## 使用方式

只需對 AI 說：

```text
請安裝 https://github.com/good1515/ftp-db-agent-skills 到目前專案
```

安裝器會在背後自動辨識 Repository 內的 skills，並同時安裝至 Codex 的 `skills` 與 Claude Code 的 `.claude/skills`；使用者不需要執行 Python 指令或指定安裝路徑。

安裝完成後必須立即提醒使用者編輯完整絕對路徑：

```text
<目前專案根目錄的絕對路徑>/.env
```

FTP 欄位：`FTP_HOST`、`FTP_USER`、`FTP_PASSWORD`、`FTP_PORT`、`FTP_SECURE`、`FTP_REMOTE_DIR`。

資料庫欄位：`DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASS`、`DB_NAME`。

使用者回覆已設定完成後，優先驗證兩項連線。FTP 只執行登入驗證；DB 只執行 `SELECT 1`。兩者都成功時明確回報：`FTP 連線成功；DB 連線成功`。任一失敗時，先自行處理非敏感的格式或路徑問題，再回報具體錯誤與仍需使用者確認的項目。

如果使用者直接在訊息中提供設定值，立即將明確提供的欄位寫入上述 `.env` 完整路徑，再執行相同連線驗證；不要把密碼重新貼回回覆。

## 安全規則

- 不覆蓋同名 skill，也不對現有目錄執行刪除或清空。
- 只接受 Repository 內的相對路徑；拒絕路徑穿越與壓縮檔寫出暫存目錄。
- 下載與複製完成前使用暫存目錄，完成或失敗後清理暫存檔。
- 只複製包含 `SKILL.md` 的 skill 資料夾，不把整個 Repository 當成 skill。
- `SKILL.md` 是 Codex 與 Claude Code 共通的技能核心；Codex 專用的 `agents/openai.yaml` 可保留，Claude Code 會忽略不需要的額外 metadata。
- 不讀取、不提交、不顯示任何 `.env`、金鑰、權杖或其他機密檔案內容。
- 安裝完成通知只指出 `.env` 路徑與欄位名稱，不輸出設定值，也不要求使用者在對話中提供密碼。
- 安裝流程不得刪除或覆蓋目前專案的 `.env.example`；該檔案必須保留作為設定範例。
- 遇到網路錯誤、沒有找到 skill 或驗證失敗時停止並以繁體中文說明，不假裝安裝成功。
