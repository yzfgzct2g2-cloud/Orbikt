# Orbikt UI Design System

版本：v0.1
用途：作為 Orbikt 後續所有介面、模組、Dashboard、Widget、AI 助理區塊與資料視覺化的統一設計規範。

---

# 1. 設計定位

Orbikt 的介面定位不是一般後台，也不是單純資料看板，而是：

> AI Operating Dashboard
> 模組化工作台
> 多系統資訊整合中心
> 使用者每日決策入口

介面必須呈現以下感覺：

1. 清楚
2. 乾淨
3. 有科技感但不冰冷
4. 資料密度高但不能壓迫
5. 可模組切換
6. 適合長時間工作
7. 可支援長照、記帳、專案、知識、AI 分析等不同模組
8. 所有資訊應先被整理，再呈現給使用者

Orbikt 的首頁不是單純展示數據，而是幫助使用者回答：

* 今天有什麼重要事情？
* 哪些項目需要優先處理？
* 哪些資料出現異常？
* 哪些模組正在啟用？
* AI 建議下一步做什麼？

---

# 2. 整體視覺風格

## 2.1 主風格

採用：

* Light SaaS Dashboard
* Soft Glass Card
* Pastel Accent
* Rounded Modular Layout
* AI Productivity Tool
* Calm Analytics Interface

避免：

* 過度繽紛
* 強烈霓虹色
* 厚重陰影
* 高飽和背景
* 遊戲化過度
* 資料表格密度過高
* 老式行政系統風格

## 2.2 視覺關鍵字

* clean
* calm
* modular
* intelligent
* friendly
* professional
* spacious
* data-informed
* health-tech
* AI assistant

---

# 3. 色彩系統

## 3.1 基礎背景色

```css
--color-bg-main: #F7FAFF;
--color-bg-soft: #F3F6FB;
--color-bg-card: #FFFFFF;
--color-bg-sidebar: #F8FAFD;
--color-bg-hover: #EEF4FF;
--color-bg-active: #E8F0FF;
```

使用原則：

* 主背景使用極淺藍白色。
* 卡片以純白為主。
* 區塊之間使用淡灰藍色分隔。
* 不使用純灰背景作為主視覺。
* 不使用大面積高飽和色塊。

---

## 3.2 品牌主色

```css
--color-primary: #2563EB;
--color-primary-soft: #DBEAFE;
--color-primary-hover: #1D4ED8;
--color-primary-text: #1E40AF;
```

用途：

* 主要按鈕
* 選取狀態
* Sidebar active item
* 主要資料連結
* Dashboard 重要操作

使用限制：

* 不可整頁大量使用主藍色。
* 主藍色只用於引導行為與目前狀態。
* 每個畫面最多 1 個 primary CTA。

---

## 3.3 模組色彩

每個模組固定使用一組代表色，所有卡片、Icon、Tag、Chart、Badge 必須一致。

### 長照模組

```css
--module-care: #22C55E;
--module-care-soft: #DCFCE7;
--module-care-text: #15803D;
```

用途：

* AA01
* FA310
* 派案
* 長照法規
* 個案提醒

語意：照顧、穩定、服務、健康。

---

### 記帳模組

```css
--module-finance: #F59E0B;
--module-finance-soft: #FEF3C7;
--module-finance-text: #B45309;
```

用途：

* 支出
* 收入
* 發票
* 月報
* 異常支出

語意：金額、發票、財務、消費。

---

### 專案模組

```css
--module-project: #3B82F6;
--module-project-soft: #DBEAFE;
--module-project-text: #1D4ED8;
```

用途：

* GitHub
* Commit
* 任務
* 進度
* Roadmap

語意：建構、任務、流程、開發。

---

### 知識模組

```css
--module-knowledge: #8B5CF6;
--module-knowledge-soft: #EDE9FE;
--module-knowledge-text: #6D28D9;
```

用途：

* 筆記
* 網址
* PDF
* 知識圖譜
* Notion 同步

語意：閱讀、整理、知識、理解。

---

### 數據分析模組

```css
--module-analytics: #06B6D4;
--module-analytics-soft: #CFFAFE;
--module-analytics-text: #0E7490;
```

用途：

* 趨勢圖
* 統計
* 指標
* 成效分析

語意：分析、監測、趨勢、洞察。

---

### AI 助理

```css
--module-ai: #6366F1;
--module-ai-soft: #E0E7FF;
--module-ai-text: #4338CA;
```

用途：

* AI 建議
* AI 分析中
* 自動摘要
* 模型狀態
* Decision Engine

語意：智能、輔助、建議、判斷。

---

## 3.4 狀態色彩

```css
--status-success: #16A34A;
--status-success-soft: #DCFCE7;

--status-warning: #F59E0B;
--status-warning-soft: #FEF3C7;

--status-danger: #EF4444;
--status-danger-soft: #FEE2E2;

--status-info: #2563EB;
--status-info-soft: #DBEAFE;

--status-muted: #64748B;
--status-muted-soft: #F1F5F9;
```

使用原則：

* 高風險：紅色
* 中風險：橘色
* 低風險：藍色或灰色
* 完成：綠色
* 等待：灰藍色

不可使用紅色表示一般提醒。

---

# 4. 字體與文字規則

## 4.1 字體

建議使用：

```css
font-family:
  "Inter",
  "Noto Sans TC",
  "PingFang TC",
  "Microsoft JhengHei",
  sans-serif;
```

## 4.2 字級

```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 22px;
--text-2xl: 28px;
--text-3xl: 34px;
```

## 4.3 使用規則

### 頁面標題

* 28px 或 34px
* 字重 700
* 用於首頁、模組主頁

### 區塊標題

* 18px
* 字重 700
* 用於卡片標題、Dashboard 區塊

### 卡片主要數字

* 28px
* 字重 700
* 數字要清楚、留白足夠

### 補充文字

* 13px 或 14px
* 顏色使用 muted

## 4.4 文字語氣

介面文字應該：

* 簡短
* 直接
* 避免情緒化
* 避免過度鼓勵語
* 優先說明狀態與下一步

建議：

```text
AI 已完成分析
需處理 2 項
查看建議
待確認
本月支出
較上月 -8%
```

避免：

```text
太棒了！
你今天做得很好！
快來看看超棒的分析！
```

---

# 5. 版面規則

## 5.1 桌機主版型

```text
左側 Sidebar：240px
主內容區：calc(100% - 240px)
頁面最大寬度：不限制，但內容需有內距
主內容 Padding：24px 至 32px
卡片間距：16px 至 24px
```

## 5.2 主要結構

每個主要頁面應包含：

```text
Sidebar
Top Header
Page Title Area
Module Switch / Context Bar
Dashboard Grid
AI Suggestion / Alert Area
Bottom or Floating Quick Action
```

## 5.3 Dashboard Grid

建議使用 CSS Grid：

```css
grid-template-columns: repeat(12, 1fr);
gap: 16px;
```

常用寬度：

```text
小 KPI 卡：3 columns
中型卡片：4 columns
大型圖表：6 columns
完整寬度：12 columns
右側建議欄：3 or 4 columns
主內容欄：8 or 9 columns
```

## 5.4 響應式規則

### Desktop ≥ 1280px

* Sidebar 固定顯示
* Dashboard 12 欄
* 模組卡橫向排列
* 圖表與矩陣可並排

### Tablet 768px - 1279px

* Sidebar 可收合
* Dashboard 6 欄
* 模組卡 2 欄
* 艾森豪矩陣仍保持 2x2

### Mobile < 768px

* Sidebar 改 bottom navigation 或 drawer
* Dashboard 單欄
* 模組切換改橫向 scroll
* 圖表單張顯示
* 艾森豪矩陣改上下排列，或維持 2x2 但縮小文字

---

# 6. Sidebar 規則

## 6.1 Sidebar 區塊

Sidebar 應包含：

```text
Logo
主要導航
模組中心
通知與 AI 助理
系統設定
使用者資訊
```

範例：

```text
Orbikt
AI · Knowledge · Action

總覽 Dashboard
模組中心
資料總覽
AI 助理
通知中心

長照模組
記帳模組
專案管理模組
知識管理模組
數據分析模組

設定中心
資料庫
系統日誌
```

## 6.2 Sidebar active 狀態

```css
background: var(--color-primary-soft);
color: var(--color-primary-text);
border-radius: 12px;
```

Icon 與文字同色。

## 6.3 Sidebar 模組顯示

啟用模組應顯示在 Sidebar 中。

未啟用模組不應塞滿 Sidebar，可放於「模組中心」。

---

# 7. Top Header 規則

Top Header 右側應包含：

* 模組切換按鈕
* 搜尋
* 通知
* 深色模式切換
* 使用者 Avatar
* 使用者角色

範例：

```text
[模組切換] [搜尋] [通知 12] [深色模式] [Richard 管理者]
```

## 7.1 搜尋

搜尋應支援：

* 模組名稱
* 案件
* 發票
* 網址
* 筆記
* 任務
* 法規
* 關鍵字

Placeholder：

```text
搜尋案件、筆記、發票、任務...
```

---

# 8. 模組切換設計

## 8.1 模組卡

模組卡是 Orbikt 的核心入口。

每張模組卡需包含：

```text
Icon
模組名稱
狀態 Badge
簡短說明
切換開關
```

範例：

```text
長照模組
已啟用
AA01 / FA310 / 法規 / 派案
[Toggle]
```

## 8.2 模組卡尺寸

```css
min-height: 120px;
border-radius: 20px;
padding: 20px;
```

## 8.3 啟用狀態

啟用模組：

* 使用該模組 soft color 背景
* 邊框使用該模組主色 20% opacity
* Toggle 為開啟狀態
* Badge 顯示「已啟用」

未啟用模組：

* 白色背景
* 灰色邊框
* Badge 顯示「未啟用」
* Toggle 為關閉狀態

## 8.4 模組啟用後的變化

使用者啟用模組後：

1. Sidebar 出現該模組入口
2. Dashboard 增加該模組 Widget
3. AI Router 開始辨識該模組資料
4. Quick Action 增加該模組快捷操作
5. 通知中心加入該模組事件

---

# 9. Dashboard 首頁規則

首頁應呈現「當天工作狀態」，不是單純功能選單。

## 9.1 首頁基本區塊

```text
Greeting
Module Switch
Today Summary
Enabled Module Overview
Eisenhower Matrix
AI Assistant Suggestions
Recent Activity
Quick Actions
Trend Overview
```

## 9.2 Greeting

格式：

```text
早安，Richard
今天是 2025 年 5 月 20 日（二）09:30
```

可依時間切換：

```text
早安
午安
晚安
```

避免過度情緒化。

---

# 10. KPI 卡片規則

## 10.1 KPI 卡片內容

每張 KPI 卡應包含：

```text
標題
主數字
單位
變化值
小趨勢圖
Icon
```

範例：

```text
今日新增
28
+12% 較昨日
```

## 10.2 KPI 卡片樣式

```css
background: #FFFFFF;
border: 1px solid #E2E8F0;
border-radius: 20px;
box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
padding: 20px;
```

## 10.3 數字呈現

* 數字要大
* 單位要小
* 變化值要使用狀態色
* 不要在同一張卡塞太多資訊

---

# 11. 卡片設計規則

## 11.1 基本卡片

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}
```

## 11.2 卡片 Header

每張卡片應有：

```text
標題
可選：查看全部 / 查看詳情 / 篩選
```

標題靠左，操作靠右。

## 11.3 卡片間距

```css
gap: 16px;
padding: 20px;
```

不可讓卡片貼邊。

## 11.4 卡片 hover

```css
transform: translateY(-1px);
box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
```

hover 不可過度動畫。

---

# 12. Icon 規則

## 12.1 Icon 風格

使用：

* Rounded
* Soft filled icon background
* 24px icon
* 40px icon container

推薦 lucide-react。

## 12.2 Icon 容器

```css
width: 40px;
height: 40px;
border-radius: 12px;
display: flex;
align-items: center;
justify-content: center;
```

## 12.3 Icon 對應

```text
長照：Heart
記帳：CircleDollarSign / Receipt
專案：Folder
知識：BookOpen
數據：BarChart3
AI：Bot / Sparkles
通知：Bell
任務：CheckSquare
搜尋：Search
設定：Settings
```

---

# 13. Badge / Tag 規則

## 13.1 Badge 類型

```text
已啟用
未啟用
高
中
低
待確認
AI 已分析
需處理
```

## 13.2 Badge 樣式

```css
border-radius: 999px;
padding: 4px 10px;
font-size: 12px;
font-weight: 600;
```

## 13.3 優先級色彩

```text
高：danger
中：warning
低：info
完成：success
待確認：muted
```

---

# 14. 艾森豪矩陣設計規則

## 14.1 區塊定位

艾森豪矩陣用於任務優先排序，應放在 Dashboard 右側或任務模組首頁。

## 14.2 結構

固定四象限：

```text
重要且緊急
重要但不緊急
緊急但不重要
不重要不緊急
```

軸線：

```text
Y 軸：重要
X 軸：緊急
```

## 14.3 色彩

```css
重要且緊急：
background: #FEE2E2;
border: #FCA5A5;
text: #B91C1C;

重要但不緊急：
background: #FEF3C7;
border: #FCD34D;
text: #B45309;

緊急但不重要：
background: #DBEAFE;
border: #93C5FD;
text: #1D4ED8;

不重要不緊急：
background: #F1F5F9;
border: #CBD5E1;
text: #475569;
```

## 14.4 每格內容

每格最多顯示：

```text
象限標題
任務數量
前 2～3 筆任務
```

超過的內容顯示：

```text
查看全部
```

## 14.5 任務排序

排序規則：

1. 高風險
2. 到期日近
3. AI 判斷需人工處理
4. 使用者手動置頂

## 14.6 任務文字

任務文字應短：

```text
AA01 退件處理
FA310 需確認
法規更新閱讀
發票待確認
```

避免長句直接塞入矩陣。

---

# 15. AI 助理區塊規則

## 15.1 AI 建議卡

AI 建議區塊應該固定存在於首頁或右側欄。

內容包括：

```text
AI 助理建議
重點摘要
建議動作
按鈕：查看建議 / 與 AI 對話
```

## 15.2 AI 建議語氣

必須像工作助理，不像聊天機器人。

建議：

```text
根據今日資料，建議優先處理 AA01 退件原因相似案件，並確認 FA310 待確認項目。
```

避免：

```text
我發現你好像很忙喔！要不要我幫你呢？
```

## 15.3 AI 狀態

```text
AI 分析中
AI 已完成分析
需人工確認
資料不足
```

## 15.4 AI 不確定性

AI 若判斷不確定，介面要顯示：

```text
信心度不足，建議人工確認
```

不可把 AI 推論包裝成確定事實。

---

# 16. 圖表設計規則

## 16.1 圖表類型

使用：

```text
Line Chart：趨勢
Donut Chart：比例
Bar Chart：分類比較
Mini Sparkline：KPI 小趨勢
Heatmap：未來可用於使用頻率
```

## 16.2 圖表風格

* 不使用 3D 圖表
* 不使用過度陰影
* 不使用高飽和撞色
* 不使用太多格線
* Legend 清楚
* 數字要有單位

## 16.3 圖表色彩

圖表顏色應優先使用模組色彩。

例如：

```text
長照：green
記帳：amber
專案：blue
知識：violet
分析：cyan
AI：indigo
```

## 16.4 Donut Chart

中心可放總數：

```text
386
筆
```

或：

```text
$12,450
本月總額
```

## 16.5 趨勢圖

線圖應顯示：

```text
時間
數值
比較基準
```

例如：

```text
較上月 -8%
較昨日 +2
```

---

# 17. 列表設計規則

## 17.1 最近活動

每筆活動應包含：

```text
Icon
標題
標籤
時間
```

範例：

```text
發票 $236 已加入記帳     10:25
AA01 新案：張○○ 計畫撰寫中     09:47
FA310 案例 #A125 退件     09:15
```

## 17.2 待辦事項

每筆待辦應包含：

```text
Checkbox
任務標題
優先級 Badge
日期
```

範例：

```text
[ ] AA01 計畫目標補強    高    5/19
```

## 17.3 列表高度

卡片內列表建議最多顯示 5 筆。

超過顯示：

```text
查看全部
```

---

# 18. Quick Actions 規則

首頁應有快速操作。

範例：

```text
新增筆記
上傳檔案
記帳
新增案件
AI 問答
建立任務
```

每個 Quick Action 應為方形或短卡片。

```css
border-radius: 16px;
padding: 16px;
```

---

# 19. 模組頁面規則

## 19.1 長照模組

應包含：

```text
今日派案狀態
AA01 待處理
FA310 退件風險
法規異動
個案提醒
服務碼查詢
```

主要色：green。

## 19.2 記帳模組

應包含：

```text
今日支出
本月支出
發票待確認
支出分類
異常支出
月報
```

主要色：amber。

## 19.3 專案模組

應包含：

```text
專案列表
GitHub Commit
任務進度
Roadmap
待審查項目
版本紀錄
```

主要色：blue。

## 19.4 知識模組

應包含：

```text
最新筆記
網址收藏
PDF 摘要
知識圖譜
Notion 同步狀態
標籤雲
```

主要色：violet。

## 19.5 數據分析模組

應包含：

```text
資料來源統計
使用趨勢
模組使用量
AI 分析量
任務完成率
異常監測
```

主要色：cyan。

---

# 20. 模組化系統規則

## 20.1 Core 與 Module 分離

Orbikt 必須分為：

```text
Orbikt Core
Modules
Widgets
Connectors
AI Capabilities
```

Core 不應直接寫死特定模組邏輯。

## 20.2 Module 註冊格式

建議資料結構：

```ts
export type OrbiktModule = {
  id: string
  name: string
  description: string
  category: 'care' | 'finance' | 'project' | 'knowledge' | 'analytics' | 'ai'
  enabled: boolean
  icon: string
  color: string
  softColor: string
  routes: string[]
  dashboardWidgets: string[]
  quickActions: string[]
  aiCapabilities: string[]
}
```

## 20.3 Widget 註冊格式

```ts
export type OrbiktWidget = {
  id: string
  moduleId: string
  title: string
  size: 'small' | 'medium' | 'large' | 'full'
  component: React.ComponentType
  requiresData?: boolean
}
```

## 20.4 新增模組原則

新增模組時，不得修改 Dashboard 主邏輯。

應透過：

```text
registerModule()
registerWidget()
registerRoute()
registerAICapability()
```

完成。

---

# 21. 互動規則

## 21.1 Toggle

模組切換 Toggle 必須有即時視覺回饋。

開啟：

```text
已啟用
```

關閉：

```text
未啟用
```

## 21.2 點擊模組卡

點擊卡片主體應進入模組頁面。

點擊 Toggle 只負責啟用或停用。

## 21.3 查看詳情

所有 Dashboard 卡片右上角可有：

```text
查看全部
查看詳情
```

## 21.4 Loading

資料載入時使用 Skeleton。

不可出現空白畫面。

## 21.5 Empty State

未啟用模組時顯示：

```text
尚未啟用此模組
啟用後可在 Dashboard 查看相關資料
[啟用模組]
```

---

# 22. 深色模式規則

深色模式可作為後續功能，但設計需預留。

建議色彩：

```css
--dark-bg-main: #0F172A;
--dark-bg-card: #111827;
--dark-bg-sidebar: #020617;
--dark-border: #1E293B;
--dark-text-main: #F8FAFC;
--dark-text-muted: #94A3B8;
```

深色模式規則：

* 不使用純黑。
* 卡片要比背景略亮。
* 邊框要低對比。
* 模組色彩降低飽和度。
* 圖表不可刺眼。

---

# 23. 可讀性與可用性規則

## 23.1 資料密度

每個畫面最多呈現：

```text
1 個主要目標
3～5 個主要區塊
5～8 個關鍵數字
```

不要同時塞入所有模組資訊。

## 23.2 重要性排序

Dashboard 資訊排序：

1. 需人工處理
2. 高風險
3. 今日到期
4. AI 建議
5. 趨勢統計
6. 最近活動

## 23.3 顏色不得作為唯一辨識

高、中、低除了顏色，也必須有文字 Badge。

例如：

```text
高
中
低
```

---

# 24. 資料真實性規則

若使用假資料，程式中必須明確標示：

```ts
// Mock data for UI prototype only
```

不可混用假資料與正式資料而未標示。

AI 推論結果需分成：

```text
已確認資料
AI 推論
需人工確認
```

介面不可讓使用者誤以為 AI 推論就是正式結論。

---

# 25. 命名規則

## 25.1 頁面命名

```text
DashboardPage
ModuleCenterPage
CareModulePage
FinanceModulePage
ProjectModulePage
KnowledgeModulePage
AnalyticsModulePage
SettingsPage
```

## 25.2 元件命名

```text
Sidebar
TopHeader
ModuleSwitchCard
KpiCard
DashboardSection
EisenhowerMatrix
AiSuggestionCard
RecentActivityList
QuickActionGrid
TrendChartCard
```

## 25.3 檔案結構建議

```text
src/
  components/
    layout/
      Sidebar.tsx
      TopHeader.tsx
      AppShell.tsx

    dashboard/
      KpiCard.tsx
      DashboardSection.tsx
      AiSuggestionCard.tsx
      EisenhowerMatrix.tsx
      RecentActivityList.tsx
      QuickActionGrid.tsx

    modules/
      ModuleSwitchCard.tsx
      ModuleGrid.tsx

    charts/
      DonutChart.tsx
      LineChart.tsx
      Sparkline.tsx

  modules/
    registry.ts
    types.ts
    care/
    finance/
    project/
    knowledge/
    analytics/

  styles/
    tokens.css
    globals.css

  data/
    mockDashboardData.ts
```

---

# 26. Codex 實作規則

Codex 在製作介面時必須遵守：

1. 不直接把所有 UI 寫在 `App.tsx`。
2. 必須拆成可維護元件。
3. 必須使用統一 design tokens。
4. 必須建立 module registry。
5. Dashboard 顯示內容需依啟用模組動態切換。
6. 假資料必須集中放在 `mockDashboardData.ts`。
7. 不得在元件中散落 hardcoded mock data。
8. 不得新增不必要的大型 UI 套件。
9. 優先使用 CSS / Tailwind / 現有樣式系統。
10. 圖表若使用 recharts，需封裝在 charts components。
11. 所有按鈕、卡片、Badge 要風格一致。
12. 目前數據可為假資料，但切換模組必須可互動。
13. 艾森豪矩陣必須納入 Dashboard。
14. 介面需支援未來接真實 API。
15. 所有新功能需通過 lint、typecheck、build。

---

# 27. 第一版 UI Prototype 目標

第一版不追求完整功能，而是驗證設計方向。

必須完成：

```text
1. Orbikt AppShell
2. Sidebar
3. TopHeader
4. Dashboard 首頁
5. 模組切換卡
6. 啟用 / 停用模組互動
7. 今日重點
8. KPI 卡片
9. 長照模組概覽
10. 記帳模組概覽
11. 艾森豪矩陣
12. AI 助理建議
13. 最近活動
14. 快速操作
15. 假資料圖表
```

可暫緩：

```text
1. 真實 API
2. Telegram 串接
3. Notion 串接
4. PostgreSQL
5. 權限系統
6. 多人協作
7. AI 真實分析
```

---

# 28. 給 Codex 的完整指令

請依照 `docs/ORBİKT_UI_DESIGN_SYSTEM.md` 建立 Orbikt 的第一版模組化 Dashboard UI Prototype。

目標是建立一個可實際切換模組的前端介面，用來驗證 Orbikt 的產品方向。
目前不需要串接真實資料，所有數據可以使用 mock data，但必須集中管理，並保留未來接 API 的架構。

請完成以下事項：

## A. 建立設計基礎

1. 建立或整理 design tokens。
2. 定義色彩、字體、間距、圓角、陰影。
3. 確保所有元件使用統一樣式。
4. 不要在各元件中任意使用不一致的顏色。

## B. 建立 App Shell

建立：

```text
Sidebar
TopHeader
MainContent
AppShell
```

Sidebar 需包含：

```text
Orbikt Logo
總覽 Dashboard
模組中心
資料總覽
AI 助理
通知中心
長照模組
記帳模組
專案管理模組
知識管理模組
數據分析模組
設定中心
```

TopHeader 需包含：

```text
模組切換按鈕
搜尋
通知
深色模式切換
使用者資訊
```

## C. 建立模組系統

建立：

```text
src/modules/types.ts
src/modules/registry.ts
```

定義：

```ts
type OrbiktModule = {
  id: string
  name: string
  description: string
  category: 'care' | 'finance' | 'project' | 'knowledge' | 'analytics'
  enabled: boolean
  icon: string
  color: string
  softColor: string
  routes: string[]
  dashboardWidgets: string[]
  quickActions: string[]
  aiCapabilities: string[]
}
```

第一版模組：

```text
長照模組
記帳模組
專案管理模組
知識管理模組
數據分析模組
```

預設啟用：

```text
長照模組
記帳模組
```

其餘預設未啟用。

## D. 建立 Dashboard 首頁

首頁需包含：

```text
Greeting
模組快速切換
今日重點
KPI Cards
啟用模組概覽
艾森豪矩陣
AI 助理建議
最近活動
快速操作
趨勢總覽
```

Dashboard 內容需依啟用模組調整。

例如：

啟用長照模組時顯示：

```text
今日派案狀態
AA01 待處理
FA310 退件風險
法規異動
```

啟用記帳模組時顯示：

```text
今日支出
本月支出分類
發票待確認
```

停用模組後，相關 Widget 不應顯示。

## E. 建立艾森豪矩陣

建立 `EisenhowerMatrix.tsx`。

固定四象限：

```text
重要且緊急
重要但不緊急
緊急但不重要
不重要不緊急
```

每格顯示：

```text
任務數量
前 2～3 筆任務
```

色彩需依設計守則：

```text
重要且緊急：紅色系
重要但不緊急：橘色系
緊急但不重要：藍色系
不重要不緊急：灰色系
```

## F. 建立 AI 助理建議卡

建立 `AiSuggestionCard.tsx`。

內容使用 mock data：

```text
根據今日資料，建議優先處理 AA01 退件原因相似案件，並確認 FA310 待確認項目。
```

按鈕：

```text
查看建議
與 AI 對話
```

## G. 建立圖表元件

可使用現有圖表工具或 recharts。
建立封裝元件：

```text
DonutChart
LineChart
Sparkline
```

目前資料使用 mock data。

圖表需符合設計守則：

```text
柔和色彩
清楚標籤
不使用 3D
不使用高飽和撞色
```

## H. 建立 mock data

建立：

```text
src/data/mockDashboardData.ts
```

集中放：

```text
今日重點
KPI
模組資料
待辦事項
最近活動
艾森豪矩陣資料
圖表資料
AI 建議
```

所有 mock data 必須註解：

```ts
// Mock data for UI prototype only
```

## I. 品質要求

完成後請執行：

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

若專案沒有其中某些 script，請回報而不是忽略。

## J. 禁止事項

不得：

1. 把所有程式寫在單一 App.tsx。
2. 為了畫面快速完成而破壞既有架構。
3. 直接寫死所有模組狀態。
4. 在多個元件中重複 mock data。
5. 使用過度複雜的動畫。
6. 使用不一致色彩。
7. 移除既有 Orbikt 功能。
8. 破壞目前已通過的測試。
9. 直接串接真實 AI API。
10. 將 Notion、Telegram、PostgreSQL 串接納入本階段。

## K. 本階段完成定義

完成後應達到：

```text
1. 使用者可以看到 Orbikt 模組化 Dashboard。
2. 使用者可以切換長照、記帳、專案、知識、數據分析模組。
3. 啟用模組會改變 Dashboard Widget。
4. 艾森豪矩陣可正常顯示。
5. 今日重點、AI 建議、最近活動、快速操作可顯示。
6. UI 風格與設計守則一致。
7. 專案可 build。
8. 不影響現有功能。
```

---

# 29. 長期原則

未來所有 Orbikt 介面都必須遵守：

```text
Core 不依賴單一模組
Module 透過 registry 註冊
Widget 由模組提供
Dashboard 依模組啟用狀態動態組合
AI 建議需標示是否為推論
假資料與真實資料不可混淆
Notion 是閱讀層，不是主資料庫
PostgreSQL / Supabase 才是正式資料來源
Dashboard 是決策入口，不只是資料展示
```

Orbikt 的長期目標是：

> 讓不同小系統的資料不只是串連，而是能被統一整理、交叉比對，最後產出可行動的綜合意見。
