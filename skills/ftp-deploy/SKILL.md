---
name: ftp-deploy
description: 當使用者要把目前專案透過 FTP 部署到 Plesk 或傳到遠端網站目錄時使用。適用於「部署到 Plesk」、「上傳到 httpdocs」、「用 FTP 發佈網站」、「設定 .env 後執行 FTP 上傳」這類需求。此 skill 使用 `scripts/deploy.cjs`，依 `.env` 內的 FTP 設定，將目前工作目錄遞迴上傳到遠端 `httpdocs` 或指定資料夾。
---

# FTP 部署到 Plesk

這個 skill 用於把目前專案透過 FTP 上傳到 Plesk 網站空間。

優先在這些情況使用：
- 使用者明確提到 `Plesk`
- 使用者要部署到 `httpdocs`
- 使用者要用 `FTP` 上傳目前網站
- 專案內已有 `.env`、FTP 帳號，或提到 FTP 主機帳密

不要在這些情況使用：
- 使用者要的是 SSH、Git、rsync、CI/CD、Docker 或雲端平台部署
- 使用者只是在問網站程式碼問題，沒有要部署

## 執行方式

1. 確認專案根目錄有 `.env`。
2. 如果沒有 `.env`，先參考 [assets/.env.example](assets/.env.example) 建立。
3. 確認 `.env` 內至少有下列欄位：

```env
FTP_HOST=ftp.your-domain.com
FTP_USER=your-ftp-username
FTP_PASSWORD=your-ftp-password
FTP_PORT=21
FTP_SECURE=false
FTP_REMOTE_DIR=/httpdocs
```

4. 在要部署的專案根目錄執行：

```powershell
node scripts/deploy.cjs
```

5. 如果使用者只要你協助檢查，不要直接部署；先檢查 `.env`、遠端目錄與忽略清單。

## 這個 skill 已知會忽略的內容

`scripts/deploy.cjs` 目前會略過這些名稱：
- `.git`
- `node_modules`
- `skills`
- `ftp-deploy`
- `ftp-deploy.skill`
- `package-lock.json`
- `README.md`
- `.env`
- `migrate.php`

另外，除了 `.htaccess` 以外，其他以 `.` 開頭的檔案也會被略過。

## 使用時的工作原則

- 先確認目前工作目錄是不是使用者想部署的專案根目錄。
- 先確認 `.env` 是否存在，再決定要不要執行部署。
- 如果使用者沒有提供 FTP 帳密，不要自行假設真實值。
- 如果使用者只說「幫我部署」，先檢查必要設定是否齊全。
- 如果需要排查失敗原因，再讀 [references/deploy-checklist.md](references/deploy-checklist.md)。

## 相關資源

- 執行腳本：`scripts/deploy.cjs`
- 環境變數範例：`assets/.env.example`
- 檢查與排錯：`references/deploy-checklist.md`
