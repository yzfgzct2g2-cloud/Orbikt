// Automation transparency registry.
//
// ACCEPTANCE ▸ Automation: automation must be explainable, traceable, and
// verifiable by users; it must never silently change important data. This
// registry is the user-facing (and reviewer-facing) catalogue of every
// automated derivation in Orbikt: what it does, the rule it follows, the data
// it reads, where its output appears, and where the logic lives in code.
//
// Rule of honesty: an automation NOT listed here should not exist. When adding
// a derivation, add its entry.

export interface AutomationEntry {
  id: string;
  name: string;
  rule: string; // plain-language rule — the "why" a result occurs
  source: string; // data the automation reads (traceability)
  surface: string; // where the output appears
  codePath: string; // where the logic lives (verifiability)
  writes: "nothing" | "session-state"; // what it may change
}

export const automationRegistry: AutomationEntry[] = [
  {
    id: "today-tasks",
    name: "今日待辦產生 Today Tasks",
    rule: "由今日行程（會議/排程訪視）與個案狀態（待完成照顧計畫、派案追蹤）推導今日的前瞻性工作項目；不含逾期項目（逾期屬異常通知）。",
    source: "generated 個案資料 + 今日行程（DataAdapter）",
    surface: "Command Center ▸ 今日待辦",
    codePath: "src/modules/dashboard/tasks.ts",
    writes: "nothing",
  },
  {
    id: "abnormal-detection",
    name: "異常偵測 Abnormal Detection",
    rule: "家訪逾期、派案 Timeout／全數無人力、AA01 未建立（服務中個案）、FA310 退件、來源缺漏／過期／未匯入 → 產生異常通知，依嚴重度排序。",
    source: "每案 visit / dispatch / aa01 / fa310 狀態（僅讀取，不重算）＋ 來源狀態登錄",
    surface: "Command Center ▸ 異常通知、Workspace ▸ 個案異常",
    codePath: "src/modules/dashboard/abnormal.ts",
    writes: "nothing",
  },
  {
    id: "eisenhower",
    name: "艾森豪矩陣分類 Eisenhower",
    rule: "將現有工作訊號（逾期、退件、派案異常、到期訪視等）依「緊急×重要」規則分入四象限；每項可點擊回到對應個案/頁籤。",
    source: "異常偵測與訪視/派案狀態（同上，僅讀取）",
    surface: "Command Center ▸ 艾森豪矩陣",
    codePath: "src/modules/dashboard/eisenhower.ts",
    writes: "nothing",
  },
  {
    id: "next-action",
    name: "下一步建議 Next Action",
    rule: "取本案最高嚴重度異常對應的行動；無異常時依模組進度（AA01 → FA310 → 訪視）建議下一步。每個建議附理由（reason）。",
    source: "本案異常偵測結果 + 模組狀態",
    surface: "Workspace ▸ 下一步 Next Action（每個頁籤可見）",
    codePath: "src/modules/workspace/caseFocus.ts",
    writes: "nothing",
  },
  {
    id: "completion-checklist",
    name: "完成度檢核 Completion Checklist",
    rule: "六項檢核（開案、評估/CMS、AA01 核定、FA310 通過、派案完成、訪視在軌）逐項讀取既存狀態並附目前狀態說明；不重算任何 SSOT 數值。",
    source: "個案主檔 + 模組/訪視/派案狀態（僅讀取）",
    surface: "Workspace ▸ Overview 完成度檢核 + 案件橫幅 完成度 x/6",
    codePath: "src/modules/workspace/caseChecklist.ts",
    writes: "nothing",
  },
  {
    id: "manager-matching",
    name: "個管比對 Manager Matching",
    rule: "個管歸屬以 FA310 為主（欄位 S 個管身分證 → 名冊姓名 → team.json）；個案以身分證號比對 CS100 產生代理案號。無 FA310 紀錄之個案暫代並標示 managerSource=fallback。原始身分證號僅存在於匯入時；瀏覽器僅見 managerName／maskedManagerId／managerSource。",
    source: "input/FA310/FA310.xls + input/CS100/CS100.xls + input/manager-map/manager-map.csv（匯入腳本內）；瀏覽器僅讀 generated JSON",
    surface: "Data Center ▸ 比對結果、個案的個管員欄位",
    codePath: "src/modules/data/caseManagerMatch.ts",
    writes: "nothing",
  },
  {
    id: "source-warnings",
    name: "來源警示 Source Warnings",
    rule: "來源狀態為缺漏/過期/待匯入/暫代種子時產生對應嚴重度的警示；驗證檢查即時掃描瀏覽器資料確認無原始身分證/電話。",
    source: "來源登錄（dataSources）＋ generated 資料即時掃描",
    surface: "Data Center ▸ 來源警示／驗證結果、Command Center ▸ 異常通知",
    codePath: "src/modules/data/dataCenter.ts",
    writes: "nothing",
  },
  {
    id: "notifications",
    name: "通知產生 Notifications",
    rule: "由逾期家訪、派案 Timeout/無人力、FA310 退件推導通知（最新在前，最多 12 則）。",
    source: "每案 visit / dispatch / fa310 狀態（僅讀取）",
    surface: "Notifications 通知中心、頂欄未讀數",
    codePath: "src/adapters/Cs100DataAdapter.ts（deriveNotifications）",
    writes: "nothing",
  },
  {
    id: "dashboard-refresh",
    name: "儀表板更新 Dashboard Refresh",
    rule: "資料於進入應用時載入一次；使用者可於 Command Center 手動重新整理（重新執行所有推導）。重新整理「保留」已勾選的今日待辦完成狀態（依項目 ID 合併），絕不悄悄清除使用者的工作狀態。V1 資料來源為 generated 種子，故不做假的自動輪詢。",
    source: "DataAdapter（重新載入）＋ 既有勾選狀態（合併）",
    surface: "Command Center ▸ 重新整理鈕 + 最後更新時間",
    codePath: "src/store/useAppStore.ts（refreshData）",
    writes: "session-state",
  },
];

export function automationById(id: string): AutomationEntry | undefined {
  return automationRegistry.find((a) => a.id === id);
}
