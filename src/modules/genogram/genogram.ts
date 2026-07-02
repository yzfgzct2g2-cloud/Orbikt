// Genogram module — integration seam for the interactive family-diagram
// (互動家系圖). The prototype is a Canvas app that is NOT yet ready to embed, so
// per the Blueprint Orbikt provides a Workspace tab with a clear integration
// placeholder and a Case ID hook — it does NOT invent genogram logic, and it
// must not block V1.

import { integrations } from "../../config/appConfig";

export const genogram = {
  source: "互動家系圖 · Canvas 原型",
  status: integrations.genogram.status, // "prototype"
  integration: integrations.genogram.integration, // "workspace_tab"
  mode: "placeholder" as const,
  note: "家系圖原型尚在畫布階段；V1 建立 Workspace 分頁與整合介面，待原型成熟後嵌入並綁定 Case ID。",
};

// What remains before the genogram can be embedded (shown honestly in the tab).
export const genogramIntegrationSteps = [
  "取得互動家系圖原型可嵌入版本（iframe 或元件）",
  "以 Case ID 綁定家系圖資料",
  "家系圖資料持久化（Supabase / 本機）",
] as const;
