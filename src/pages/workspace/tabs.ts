// Workspace tab definitions. Every case-scoped module lives here as a tab —
// AA01, FA310, Dispatch, Visit, and Genogram are NOT standalone pages. The
// integration source for each is stated so shells are honest, not empty.

export interface WorkspaceTab {
  key: string;
  label: string;
}

export const workspaceTabs: WorkspaceTab[] = [
  { key: "overview", label: "Overview 總覽" },
  { key: "aa01", label: "AA01 照顧計畫" },
  { key: "fa310", label: "FA310 審查" },
  { key: "dispatch", label: "Dispatch 派案" },
  { key: "visit", label: "Visit 訪視" },
  { key: "genogram", label: "Genogram 家系圖" },
  { key: "attachments", label: "Attachments 附件" },
  { key: "timeline", label: "Timeline 時間軸" },
];

export const defaultTab = "overview";
