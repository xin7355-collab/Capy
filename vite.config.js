import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages 專案站台需要子路徑 base（例如 /Capy/），
// 由 CI 以 BASE_PATH 環境變數帶入；本機開發與根網域部署維持 '/'。
const base = process.env.BASE_PATH || '/';

/* 版本號：手機上開著的舊頁面靠它發現自己過期。
   建置時間（台北時區）給人看得懂，GITHUB_SHA 短碼對得回 git。
   'sv-SE' 這個 locale 直接輸出 YYYY-MM-DD HH:mm，不必自己拼字串。 */
const APP_VER = (() => {
  // 取到秒：同一分鐘內建置兩次也要是不同版本，否則比對會誤判成「已是最新版」
  const t = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' });
  const sha = (process.env.GITHUB_SHA || '').slice(0, 7);
  return sha ? `${t} (${sha})` : t;
})();

/* index.html 裡的 __APP_VER__ 換成版本號，同時吐一份 version.json 到站台根目錄。
   前者讓頁面知道「我是哪一版」，後者讓它問得到「伺服器上現在是哪一版」。 */
function versionStamp() {
  return {
    name: 'drip-version-stamp',
    transformIndexHtml(html) {
      return html.replace(/__APP_VER__/g, APP_VER);
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ ver: APP_VER }),
      });
    },
    /* dev server 不會跑 generateBundle，手動補一條路由，
       讓 `npm run dev` 的行為跟正式站一致（否則檢查更新永遠 404）。 */
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.split('?')[0].endsWith('/version.json')) return next();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ver: APP_VER }));
      });
    },
  };
}

export default defineConfig({
  base,
  plugins: [
    versionStamp(),
    VitePWA({
      registerType: 'autoUpdate',
      // 註冊碼直接 inline 進 index.html，維持「打開就是完整 App」的單檔精神。
      injectRegister: 'inline',
      manifest: {
        name: 'DRIP MATRIX',
        short_name: 'DRIP MATRIX',
        description: 'Intelligent Pour-Over Engine — 手沖咖啡萃取運算引擎',
        lang: 'zh-Hant',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#120d0a',
        background_color: '#120d0a',
        categories: ['food', 'lifestyle', 'utilities'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // manifest 與其 icons 由外掛自動預快取；此處只補上 iOS 主畫面圖示。
      includeAssets: ['apple-touch-icon.png'],
      workbox: {
        /* 這兩項必須手動打開。外掛只有在 injectRegister 是 'auto' 或未設定時，
           才會因為 registerType:'autoUpdate' 自動開啟它們；我們明寫了 'inline'，
           所以走不到那個分支。沒開的話新版 SW 會永遠卡在 waiting，
           使用者得把 App 完全關掉才換得到新版 —— 這正是「改了卻看不到」的根因。 */
        skipWaiting: true,
        clientsClaim: true,
        // 不含 png/webmanifest，避免與外掛自動加入的項目重複預快取。
        globPatterns: ['**/*.{html,js,css,svg}'],
        // 防呆：版本檔必須每次走網路。目前 globPatterns 本來就不含 json，
        // 但日後有人加上去時，這一行會擋住「版本檔自己被快取成舊版」的死結。
        globIgnores: ['version.json'],
        // index.html 內嵌全部樣式與邏輯，單檔會超過預設 2 MiB 上限時仍可安全預快取。
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
      devOptions: {
        // 讓 `npm run dev` 也能實測離線與安裝流程。
        enabled: true,
        type: 'module',
      },
    }),
  ],
});
