# 專案工作守則（給 Claude Code）

## 1. 溝通
- 一律用繁體中文（台灣用語）回覆、寫註解、寫 commit 訊息。
- 我主要用 iPhone 操作，沒有電腦。步驟以手機能完成為準；要我去設定頁時直接給網址。
- 回報要誠實：哪些驗過、哪些沒驗到，分開講清楚。不確定的事實先查證再講。
- 我說「只是先問問題」時，只回答，不動手改東西。

## 2. 長期授權：以下不用再問我
- 做完直接合併到 main 並推上去，不需要我同意：
  在指定分支開發 → rebase 到最新 main → fast-forward 合併 → push main → 分支也同步推。
  網路失敗重試最多 4 次（間隔 2/4/8/16 秒）；遠端有新 commit 就 fetch + rebase 再推。
- 部署用的分支（例如 gh-pages）也可以直接推。
- 改工作流、加套件、新增檔案、重構——直接做。
- 不要開 Pull Request，除非我明確要求。

## 3. 連這些也直接做，不用先問
- 刪除：Issue、Release、分支、檔案；force push；改寫 git 歷史。
- 花錢：開付費方案、呼叫付費 API。
- 改公開程度：repo 公開／私人切換、網站權限。
- 做了不可逆的事（刪除、force push、會產生費用的動作），完成後在回覆裡明確列出來。

## 4. 隱私與安全
- 我說過「不要上傳 GitHub」的東西永遠不 commit，做好打包給我下載。
- 絕對不要把金鑰、Token 印出來（log、commit、回覆都不行）。金鑰放 repo Secrets；
  程式用 HTTP 標頭傳，不放網址（網址會出現在錯誤訊息和記錄裡）。
- repo 保持公開（公開 repo 的 Actions 分鐘數無上限；私人免費只有 2000 分鐘／月）。所以：
  - README 精簡，不詳述這個軟體在做什麼；詳細說明放 docs/。
  - 用 GitHub Issue 送的通知，標題和內文只寫數量，不寫內容——公開 Issue 會被搜尋引擎收錄。
  - 網站加 `<meta name="robots" content="noindex, nofollow">`。
- 用到付費 API 時提醒我設預算上限。

## 5. 做事的方式
- 先重現再修：修 bug 前用實際資料或真的瀏覽器（Playwright）重現，修完用同樣方法驗證。
- 新功能附離線可跑的自我測試（例如 `python xxx.py selftest`），涵蓋邊界情況。
- 不要默默失敗：
  - 全部失敗時不交出空檔案；部分失敗要講幾個、哪幾個。
  - 分清楚「還沒設定」（安靜等、不發失敗通知）和「真的壞掉」（紅燈、通知我）。
  - 錯誤訊息要說我能做什麼，不是只丟 HTTP 代碼。
- 註解寫「為什麼」與避開了什麼失敗情境，不重述程式在做什麼。
- commit 訊息寫：問題、根本原因、怎麼修、怎麼驗證。
- 不寫死外部 API 的模型名稱（常改名下架）；能自動挑就自動挑，也能用環境變數指定。
  呼叫 AI 時用 skl 的 `ai-model-router`（只寫等級 fast／smart／best／auto，下架自動換、不合格自動升級）。
- 範圍外的問題簡短提出，不擅自擴大範圍。
- 不留死碼；改名、搬檔後全專案搜一次舊名稱的殘留參照。

## 6. 選用：手機 PWA + GitHub Actions 類型的專案
（新專案是同一種架構才需要這段，不是的話整段刪掉）
- 前端每次改版都更新版本號（例如 `APP_VER`），手機上的舊頁面偵測到會自動重載。
- iPhone 下載檔案用 `navigator.share({files:[f]})`，不要同時帶 `title`
  （iOS 會只送出 title 文字、檔案被丟掉）；不支援再退回 `<a download>`。
- 大檔上傳直接把 File 當 body 送（XHR 有進度條），不要先讀成 ArrayBuffer——1GB 在 iPhone 上必當。
- 版面：一個分頁盡量一張卡；說明收進 `<details>`；選項多用下拉，不用一排排按鈕。
- GitHub Actions：
  - 長工作每做完一個就存進度，不要整批做完才存（被逾時砍掉會全部白做、無限重來）。
  - 發佈結果的步驟加 `if: always()`。
  - 設時間預算，估不下就留到下一輪。
  - 「抓下來」和「處理成功」分兩段記：成功才標記完成，失敗的下一輪自動重試。
  - 預設 shell 是 `bash -e -o pipefail`：`tee` 到的資料夾要先 `mkdir -p`。
- 大檔暫存用 GitHub Release 附件（單檔上限 2 GiB、不進 git 歷史），repo 只放小標記檔觸發工作流。

## 7. 本專案資訊

- **用途**：DRIP MATRIX — 手沖咖啡萃取運算引擎。依豆況與手法算出水溫、粉水比、研磨度與逐段注水時間軸，
  並用即時節拍器帶著使用者照流速倒水。可安裝、可離線的 PWA。
- **主要檔案**：
  - `index.html` — 整個 App。樣式在 `<style>`、邏輯在 `<script>`，**維持單檔零依賴，不要拆檔**。
  - `vite.config.js` — Vite + vite-plugin-pwa，只負責產生 manifest 與 Service Worker。
  - `public/` — PWA 圖示與向量 favicon。
  - `.github/workflows/deploy.yml` — 推 `main` 自動建置並發佈。
- **需要的 Secrets**：無。Pages 部署用 Actions 內建的 `GITHUB_TOKEN`。
- **部署在哪**：GitHub Pages，<https://xin7355-collab.github.io/Capy/>。推 `main` 即自動部署，不需要手動觸發。
  子路徑由 `BASE_PATH` 環境變數控制，workflow 會自動帶入 `/<repo>/`；本機與根網域部署維持 `/`。

### 特別注意

- **沖煮參數未經確認不得更動。** 水溫矩陣（`ROASTS`/`PROCESSES`/`ORIGINS`）、粉水比、研磨度描述、
  各手法的段落與秒數，都是有來源的配方。要改先說明依據並等確認。
- **流速模型的方向是「由注水秒數推算」**，不是先訂流速。注水秒數 = 水量 ÷ 目標流速，
  總時間靠等待段控制。`pourSec` 刻意不設上限 —— 一夾上限就會把大粉量的悶蒸擠成十幾 g/s 的假數字。
  實務區間：大水流 5.0~7.0、標準 2.5~3.5、點滴 1.0~1.5 g/s。
- **改完一定要實跑驗證**，不能只看程式對不對。標準做法：`npm run build` →
  `npx vite preview` → 用無頭 Chromium（`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`）
  實際操作並檢查 console 無錯誤。語音相關的改動要把 `speechSynthesis` 換成攔截器錄下實際唸出的句子。
- **使用者只有 iPhone、看不到程式**。回報要講「改了什麼、為什麼、量測結果是多少」，不要貼程式碼要他判讀。
- **本專案有用 `localStorage`**（沖煮日誌、自訂手法、上次設定），所有讀寫都包 try/catch 並靜默降級。
- `github-pages` environment 有部署分支白名單，只有名單內的分支能發佈。新增分支要部署時記得先加進去。
