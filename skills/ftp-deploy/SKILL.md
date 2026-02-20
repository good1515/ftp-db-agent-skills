---
name: ftp-deploy
description: 將網站檔案同步部署到 Plesk FTP 伺服器上的 httpdocs 目錄。使用時機包括專案開發完成、需要更新伺服器上的網頁內容，或是使用者要求將網站上線。此技能會讀取 .env 檔案中的 FTP 設定，並自動過濾冗餘檔案。
---

# Plesk FTP 部署工具

## 概觀

此技能專為使用 Plesk 管理面板的網站開發者設計。它能協助您快速、安全地將本地專案檔案同步到伺服器的 `httpdocs` 目錄，省去手動開啟 FTP 用戶端的繁瑣步驟。

## 快速入門

### 1. 設定環境變數
請在專案根目錄建立 `.env` 檔案，或從 `assets/` 中的 `.env.example` 複製。

範例內容：
```env
FTP_HOST=ftp.your-domain.com
FTP_USER=your-ftp-username
FTP_PASSWORD=your-ftp-password
FTP_PORT=21
FTP_SECURE=false # 如果伺服器支援 TLS/SSL，建議設為 true
FTP_REMOTE_DIR=/httpdocs
```

### 2. 執行部署
當您準備好將網站上線時，請告訴我：「幫我部署到 Plesk」或「將網站上傳到 FTP」。

## 核心功能

- **自動同步**：僅上傳有變動的檔案，減少傳輸頻寬與時間。
- **檔案過濾**：自動排除以下不必要的檔案：
  - `.git/`
  - `node_modules/`
  - `.env` (包含敏感資訊)
  - `ftp-deploy` (技能目錄本身)
- **安全傳輸**：支援透過 `FTP_SECURE=true` 進行加密連線。

## 注意事項

- 請確保已將 `.env` 加入到 `.gitignore` 中，以避免將敏感密碼上傳至 Git 倉庫。
- 如果部署過程中出現逾時或連線失敗，請檢查 Plesk 的防火牆設定或確認 FTP 帳密是否正確。

## 資源與腳本

此技能使用位於 `scripts/deploy.cjs` 的 Node.js 腳本執行上傳作業。
- **主要庫**：`basic-ftp`, `dotenv`
