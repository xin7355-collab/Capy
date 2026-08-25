# DRIP MATRIX

> Intelligent Pour-Over Engine — 手沖咖啡萃取運算引擎

熱力補償、溶解率矩陣、濾杯幾何與注水節拍導航，全部包在一個可安裝、可離線使用的 PWA 裡。

## 專案結構

```
index.html            App 本體（樣式與邏輯全部內嵌，維持單檔零依賴）
vite.config.js        Vite + vite-plugin-pwa 設定（manifest / Service Worker）
public/
  icon.svg            向量 favicon
  pwa-192x192.png     PWA 圖示
  pwa-512x512.png     PWA 圖示（含 maskable）
  apple-touch-icon.png  iOS 主畫面圖示
.github/workflows/deploy.yml  推上 main 後自動部署到 GitHub Pages
```

App 本身沒有使用任何前端框架，因此建置流程只需要 Vite；`vite-plugin-pwa` 負責產生
`manifest.webmanifest`、`sw.js`（Workbox 預快取）以及注入 Service Worker 註冊碼。

## 開發

```bash
npm install
npm run dev        # http://localhost:5173（已開啟 PWA devOptions，可直接測安裝與離線）
```

## 建置與本機預覽

```bash
npm run build      # 產出 dist/
npm run preview    # http://localhost:4173
```

離線驗證：用 `npm run preview` 開啟一次頁面（Service Worker 完成安裝），
再於 DevTools → Network 勾選 Offline 後重新整理，App 應完整載入。

## 部署

### GitHub Pages（已附工作流程）

1. Repo → **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**。
2. 把本分支合併進 `main`，工作流程會自動建置並部署。
3. 網址為 `https://<帳號>.github.io/<repo>/`。

子路徑由 `BASE_PATH` 環境變數控制（工作流程會自動帶入 `/<repo>/`）。
若要部署到根網域（Netlify、Vercel、Cloudflare Pages、自訂網域），直接 `npm run build` 即可，
`base` 預設為 `/`。

### 其他靜態主機

建置指令 `npm run build`、發佈目錄 `dist`。

## PWA 行為

- `registerType: 'autoUpdate'`：偵測到新版本會自動更新 Service Worker，使用者下次開啟即為新版。
- 預快取 6 個檔案（index.html、manifest、圖示），離線可完整運作。
- 沖煮日誌與自訂手法存於瀏覽器 `localStorage`，不上傳任何資料。
- 安裝入口交還給瀏覽器原生選單（Chrome「安裝應用程式」／ Safari「加入主畫面」），
  App 內不顯示安裝提示卡片。
