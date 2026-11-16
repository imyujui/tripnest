# AI 擴充驗證紀錄

本文件記錄 TripNest 如何實際使用 `AGENTS.md` 擴充內容，而不只是把規範當成說明文字。

## 基準版本

- 初始目的地：京都、大阪、福岡。
- 共用首頁：由 `data/destinations.json` 自動產生卡片、統計、地區篩選與搜尋內容。
- 共用詳細頁：`destination.html?id=<id>` 依網址參數讀取同一份 JSON。
- 自動驗證：`node tests/validate.mjs` 檢查 Schema、唯一 ID、檔案結構與資料驅動規則。

## 擴充測試：新增東京

### 交辦內容

> 請先閱讀 `AGENTS.md`，依照「Standard workflow for adding a destination」新增東京旅行指南。不得建立新的城市 HTML，並在完成後驗證搜尋、地區篩選、詳細頁與 RWD。

### 預期約束

1. 只能以一筆完整物件擴充 `data/destinations.json`。
2. 東京 `id` 必須為唯一 kebab-case。
3. 必須有三個亮點、三項食物、三日行程與至少兩個可靠來源。
4. 必須標示資料檢視日期，避免捏造價格、班次與營業時間。
5. 既有三座城市與共用 HTML 不得被破壞。

### 驗證結果

- 實際修改：僅新增 `data/destinations.json` 的東京物件；沒有建立 `tokyo.html`，也沒有修改共用頁面模板。
- `id`：`tokyo`，通過唯一值與 kebab-case 檢查。
- 結構：三個亮點、三項食物、三日行程、四項提醒、三個官方來源，欄位完整。
- 自動測試：`node tests/validate.mjs` 由 3 座城市增加為 4 座，所有檢查通過。
- 首頁：自動出現東京卡片，搜尋「東京」與 `Tokyo` 都能找到；JSON 新增的「關東」自動成為篩選項目。
- 詳細頁：`destination.html?id=tokyo` 以既有模板正常顯示所有區段。
- 回歸測試：京都、大阪、福岡資料仍存在，既有 URL 與功能未改動。
- 響應式與錯誤處理：以手機、平板、桌面寬度檢視，並確認不存在的 ID 顯示友善返回入口。

## 結論

本次驗證證明 `AGENTS.md` 能讓 AI 在沒有重新設計頁面的情況下，依固定 Schema、內容來源與驗收流程擴充城市。資料新增後，首頁卡片、總數、搜尋、地區篩選、詳細頁與相關城市推薦皆由既有程式自動更新。
