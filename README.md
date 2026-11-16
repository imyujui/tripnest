# TripNest — 個人旅行指南庫

TripNest 是一個以 HTML、CSS、JavaScript 與 JSON 製作的響應式旅行知識庫。每座城市共用同一個詳細頁模板，首頁、搜尋、篩選與統計都從 JSON 自動產生；未來新增城市時，不需要複製 HTML。

![TripNest 使用暖米白、森林綠與朱紅色的編輯式旅行介面](https://images.unsplash.com/photo-1551106368-d9157e48a3ca?auto=format&fit=crop&q=80&w=1200)

## 五項繳交內容

### 1. 專案簡介

本專案把京都、大阪、福岡與東京整理成結構一致的旅行指南。每座城市包含城市定位、推薦景點、在地食物、交通方式、三日行程、實用提醒、資料更新日期與官方來源。網站支援即時搜尋、地區篩選、排序、空狀態、錯誤處理與手機／平板／桌面版面。

### 2. GitHub Repository

[https://github.com/imyujui/tripnest](https://github.com/imyujui/tripnest)

### 3. 公開網頁

[https://imyujui.github.io/tripnest/](https://imyujui.github.io/tripnest/)

### 4. AGENTS.md

完整規範位於 [`AGENTS.md`](AGENTS.md)，內容包含：

- 專案目的、技術限制與資料／頁面分離原則。
- 配色、字體、元件、無障礙與 RWD 規範。
- 完整的目的地 JSON Schema 與內容查證規則。
- 首頁、詳細頁、錯誤狀態的預期行為。
- 新增城市的標準流程、禁止事項與驗收清單。
- 測試、GitHub Pages 與 Definition of Done。

### 5. 規則如何幫助 AI 繼續完成？

`AGENTS.md` 把「新增目的地」拆成可重複執行的工作流程。AI 先查重與查證資料，再依固定 Schema 向 `data/destinations.json` 新增一筆物件。首頁會自動產生城市卡片、搜尋內容、地區篩選與總數；共用的 `destination.html` 會依 `?id=` 顯示完整指南。因此 AI 不必重新理解視覺、建立新頁面或修改既有城市，只需遵守資料、來源與測試規則即可安全擴充。

實際示範紀錄見 [`docs/extension-verification.md`](docs/extension-verification.md)：基準版先建立京都、大阪、福岡，再讓 AI 只依 `AGENTS.md` 新增東京，驗證規範確實能重複使用。

## 功能

- 即時搜尋城市中英文名稱、國家、地區、主題與適合旅人。
- 由 JSON 動態產生的地區篩選與目的地統計。
- 精選順序、城市名稱、最近更新三種排序。
- 京都、大阪、福岡、東京完整旅行指南。
- 一個共用詳細頁模板與相關目的地推薦。
- 找不到城市、搜尋無結果、資料載入失敗、圖片載入失敗等友善狀態。
- 鍵盤操作、可見焦點、語意化結構與 reduced-motion 支援。
- 320px 到桌面寬度的響應式版面。

## 專案結構

```text
.
├── AGENTS.md
├── README.md
├── index.html
├── destination.html
├── assets/
│   ├── css/style.css
│   └── js/{shared,app,destination}.js
├── data/destinations.json
├── docs/extension-verification.md
└── tests/validate.mjs
```

## 本機瀏覽與測試

因瀏覽器的安全限制，請透過本機 HTTP 伺服器瀏覽，不要直接雙擊 HTML：

```bash
python3 -m http.server 4173
```

前往 `http://localhost:4173/`。

執行自動驗證：

```bash
node tests/validate.mjs
```

## 新增目的地

1. 閱讀 [`AGENTS.md`](AGENTS.md) 的 Schema 與查證規範。
2. 只在 `data/destinations.json` 新增一筆完整目的地物件。
3. 執行 `node tests/validate.mjs`。
4. 以瀏覽器測試首頁搜尋／篩選與 `destination.html?id=<id>`。
5. 確認 320px、768px 與桌面版面後再部署。

## 資料與圖片

旅行資訊整理自各城市官方觀光來源，詳細連結列在每個目的地頁。照片來自 Unsplash，攝影者與原始頁面標示於圖片角落及 JSON 的 `imageCredit` 欄位。資訊可能變動，實際出發前仍應再次確認官方公告。

## 技術與部署

- HTML5 / CSS3 / Vanilla JavaScript / JSON
- 無框架、無後端、無建置步驟
- GitHub Actions + GitHub Pages

## 授權

專案程式碼可作學習與作品展示使用。旅行文字、外部圖片與連結仍依各來源的授權與規範。
