import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages 專案站台需要子路徑 base（例如 /Capy/），
// 由 CI 以 BASE_PATH 環境變數帶入；本機開發與根網域部署維持 '/'。
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
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
        // 不含 png/webmanifest，避免與外掛自動加入的項目重複預快取。
        globPatterns: ['**/*.{html,js,css,svg}'],
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
