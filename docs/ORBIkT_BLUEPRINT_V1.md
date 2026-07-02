你現在要開發 Orbikt V1.0。

Orbikt 是一套以個案為核心的專業工作平台，不是單純入口網站。

最高目標：
一次規劃、一路開發、直到完成。

你必須完整依照 Orbikt Blueprint V1.0 執行，不得自行新增功能、刪除功能或改變產品架構。

V1 必須完成：
1. Command Center
2. Cases
3. Case Workspace
4. Planner（AA01）
5. Review（FA310）
6. Dispatch
7. Visit Manager
8. Knowledge Hub
9. Genogram
10. Document Center
11. Notifications
12. Settings

開發原則：
1. Case First。
2. Workspace First。
3. Single Source of Truth。
4. Zero Duplicate Input。
5. Dashboard 不是連結頁，而是 Command Center。
6. AA01、FA310、Dispatch、Visit、Genogram 都必須整合進 Workspace。
7. 派案狀態必須可在 Dashboard 直接顯示。
8. 訪視警戒必須讀取 Visit Manager，不得另建第二套邏輯。
9. 文件中心必須支援 OneDrive 共用資料夾捷徑。
10. 不得留下 TODO、FIXME、未完成 placeholder。

執行方式：
從 Phase 0 開始，依序做到 Phase 12。
每完成一個 Phase，必須自行執行 lint、typecheck、test、build。
若失敗，必須自行修正後再進入下一 Phase。
除非遇到 API Key、外部授權、Blueprint 衝突、資料遺失風險或找不到既有專案檔案，否則不得停止詢問使用者。

技術建議：
React + TypeScript + Vite + TailwindCSS + shadcn/ui + React Router + Zustand。

資料策略：
V1 可以先使用 Mock Adapter / Local JSON / IndexedDB，但架構必須預留 Supabase、Google Apps Script API、Microsoft Graph、Google Calendar API。

最後完成條件：
npm run lint 通過。
npm run typecheck 通過。
npm run test 通過。
npm run build 通過。
所有 Phase 完成。
建立版本號 Orbikt v1.0.0。
Commit 並 Push。