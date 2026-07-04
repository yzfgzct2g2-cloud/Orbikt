# Orbikt UI Handoff for Claude Code

## 本次新增 / 修改檔案清單

新增：

- `src/modules/types.ts`
- `src/modules/registry.ts`
- `src/data/mockDashboardData.ts`
- `src/data/dashboardSelectors.ts`
- `src/data/dashboardSelectors.test.ts`
- `src/styles/tokens.css`
- `src/charts/chartUtils.ts`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/TopHeader.tsx`
- `src/components/modules/ModuleSwitchCard.tsx`
- `src/components/modules/ModuleGrid.tsx`
- `src/components/dashboard/DashboardPage.tsx`
- `src/components/dashboard/KpiCard.tsx`
- `src/components/dashboard/DashboardSection.tsx`
- `src/components/dashboard/AiSuggestionCard.tsx`
- `src/components/dashboard/EisenhowerMatrix.tsx`
- `src/components/dashboard/RecentActivityList.tsx`
- `src/components/dashboard/QuickActionGrid.tsx`
- `src/components/charts/DonutChart.tsx`
- `src/components/charts/LineChart.tsx`
- `src/components/charts/Sparkline.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/ModulePlaceholderPage.tsx`

修改：

- `src/App.tsx`
- `src/layout/AppLayout.tsx`
- `src/index.css`

## 新增元件說明

- `AppShell`：新的 Light SaaS Dashboard 外框，負責 Sidebar、TopHeader、主內容容器。
- `Sidebar`：顯示主要導航與目前啟用模組。未啟用模組不塞入側欄。
- `TopHeader`：提供模組切換入口、搜尋、通知、深色模式預留按鈕與使用者資訊。
- `DashboardPage`：Dashboard 首頁組裝層，從 selector 取得已過濾的 dashboard view model。
- `ModuleGrid` / `ModuleSwitchCard`：模組啟用 / 停用互動 UI。
- `KpiCard`、`DashboardSection`、`AiSuggestionCard`、`EisenhowerMatrix`、`RecentActivityList`、`QuickActionGrid`：Dashboard 區塊元件。
- `DonutChart`、`LineChart`、`Sparkline`：輕量 SVG 圖表元件，未新增大型圖表套件。

## 模組切換邏輯說明

`src/layout/AppLayout.tsx` 持有 `modules` state，初始值來自 `src/modules/registry.ts`。

`toggleModule(id)` 會切換指定模組的 `enabled`。`Outlet` context 將 `modules` 與 `toggleModule` 傳給 `DashboardPage`。

`DashboardPage` 呼叫 `buildDashboardViewModel(modules, mockDashboardData)`，只顯示啟用模組的 highlights、KPI、module widgets、Eisenhower tasks、recent activities、quick actions、chart series 與 donut slices。

## Mock data 位置

所有 prototype 假資料集中在：

- `src/data/mockDashboardData.ts`

檔案開頭已標示：

```ts
// Mock data for UI prototype only.
// Replace with real API data in later phases.
```

## 未來可接真實 API 的位置

- `src/data/mockDashboardData.ts` 可替換為 dashboard API response adapter。
- `src/data/dashboardSelectors.ts` 可保留為前端 view model 組裝層。
- `src/modules/registry.ts` 可改為由後端或 feature flag 回傳模組狀態。
- `AiSuggestionCard` 可接 AI suggestion API，但仍應顯示信心度與需人工確認狀態。

## 可接 Telegram / Notion / PostgreSQL 的位置

- Telegram：可在通知中心、recent activities、quick actions 加入 connector events。
- Notion：可餵入 knowledge module 的 notes、PDF、URL 摘要資料。
- PostgreSQL / Supabase：可作為正式 dashboard data source，替換 mock data。
- AI API：可產出 `AiSuggestion`，但不應在 UI 元件內直接呼叫 API。

## 已知限制

- 本階段只做 UI Prototype，不串接真實 AI API、Telegram、Notion 或 PostgreSQL。
- Finance、Project、Analytics 目前是預留模組頁，不含完整模組功能頁。
- 深色模式按鈕目前為 UI 預留，不切換 theme。
- 圖表為輕量 SVG prototype，若未來資料量增加可改為封裝 Recharts 或其他圖表工具。

## 建議 Claude Code 下一步優化事項

- 將模組狀態持久化到 URL、localStorage 或後端 user preference。
- 為 `DashboardPage` 補上 React component rendering tests。
- 將 `ModulePlaceholderPage` 擴充為正式 Module Center。
- 將 dashboard selectors 接上真實 API adapter，保留 mock data 作為 story/demo fixture。
- 補上行動版 bottom navigation 或 drawer。
