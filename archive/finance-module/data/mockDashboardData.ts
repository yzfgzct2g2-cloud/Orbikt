// Mock data for UI prototype only.
// Replace with real API data in later phases.

import type { OrbiktModuleId } from "../modules/types";

export type Priority = "高" | "中" | "低";
export type TrendDirection = "up" | "down" | "flat";
export type EisenhowerQuadrantId =
  | "important-urgent"
  | "important-not-urgent"
  | "urgent-not-important"
  | "not-important-not-urgent";

export type TodayHighlight = {
  id: string;
  moduleId: OrbiktModuleId;
  title: string;
  detail: string;
  priority: Priority;
};

export type DashboardKpi = {
  id: string;
  moduleId: OrbiktModuleId;
  title: string;
  value: string;
  unit: string;
  change: string;
  trend: TrendDirection;
  sparkline: number[];
};

export type ModuleWidget = {
  id: string;
  moduleId: OrbiktModuleId;
  title: string;
  metrics: Array<{ label: string; value: string; tone: "success" | "warning" | "danger" | "info" }>;
};

export type EisenhowerTask = {
  id: string;
  moduleId: OrbiktModuleId;
  title: string;
  priority: Priority;
  due: string;
};

export type EisenhowerQuadrant = {
  id: EisenhowerQuadrantId;
  title: string;
  tasks: EisenhowerTask[];
};

export type RecentActivity = {
  id: string;
  moduleId: OrbiktModuleId;
  title: string;
  tag: string;
  time: string;
};

export type QuickAction = {
  id: string;
  moduleId: OrbiktModuleId;
  label: string;
  description: string;
};

export type ChartSeries = {
  id: string;
  moduleId: OrbiktModuleId;
  label: string;
  color: string;
  points: Array<{ label: string; value: number }>;
};

export type DonutSlice = {
  id: string;
  moduleId: OrbiktModuleId;
  label: string;
  value: number;
  color: string;
};

export type AiSuggestion = {
  status: "AI 已完成分析" | "需人工確認" | "資料不足";
  confidence: string;
  summary: string;
  recommendedActions: string[];
};

export type DashboardData = {
  todayHighlights: TodayHighlight[];
  kpis: DashboardKpi[];
  moduleWidgets: ModuleWidget[];
  eisenhowerQuadrants: EisenhowerQuadrant[];
  recentActivities: RecentActivity[];
  quickActions: QuickAction[];
  chartSeries: ChartSeries[];
  donutSlices: DonutSlice[];
  aiSuggestion: AiSuggestion;
};

export const mockDashboardData: DashboardData = {
  todayHighlights: [
    {
      id: "care-aa01",
      moduleId: "care",
      title: "AA01 待處理",
      detail: "3 件照顧計畫需補強目標敘述",
      priority: "高",
    },
    {
      id: "care-fa310",
      moduleId: "care",
      title: "FA310 退件風險",
      detail: "2 件資料欄位與服務紀錄不一致",
      priority: "高",
    },
    {
      id: "care-law",
      moduleId: "care",
      title: "法規異動",
      detail: "長照支付項目更新需人工確認",
      priority: "中",
    },
    {
      id: "finance-spend",
      moduleId: "finance",
      title: "今日支出",
      detail: "已記錄 8 筆，合計 $2,340",
      priority: "中",
    },
    {
      id: "finance-category",
      moduleId: "finance",
      title: "本月支出分類",
      detail: "交通與耗材支出較上月增加 12%",
      priority: "中",
    },
    {
      id: "finance-invoice",
      moduleId: "finance",
      title: "發票待確認",
      detail: "5 張發票尚未歸類",
      priority: "低",
    },
    {
      id: "project-review",
      moduleId: "project",
      title: "待審查項目",
      detail: "2 個任務卡停留超過 3 天",
      priority: "中",
    },
    {
      id: "knowledge-pdf",
      moduleId: "knowledge",
      title: "PDF 摘要",
      detail: "3 份文件已完成 AI 摘要草稿",
      priority: "低",
    },
    {
      id: "analytics-anomaly",
      moduleId: "analytics",
      title: "異常監測",
      detail: "個案更新頻率低於 7 日均值",
      priority: "中",
    },
  ],
  kpis: [
    {
      id: "care-new-cases",
      moduleId: "care",
      title: "今日派案狀態",
      value: "12",
      unit: "件",
      change: "+2 較昨日",
      trend: "up",
      sparkline: [4, 6, 5, 7, 9, 8, 12],
    },
    {
      id: "care-risk",
      moduleId: "care",
      title: "退件風險",
      value: "5",
      unit: "件",
      change: "-1 較昨日",
      trend: "down",
      sparkline: [7, 6, 6, 5, 6, 4, 5],
    },
    {
      id: "finance-today",
      moduleId: "finance",
      title: "今日支出",
      value: "$2,340",
      unit: "TWD",
      change: "-8% 較昨日",
      trend: "down",
      sparkline: [34, 28, 31, 22, 24, 20, 18],
    },
    {
      id: "finance-invoices",
      moduleId: "finance",
      title: "發票待確認",
      value: "5",
      unit: "張",
      change: "+1 今日新增",
      trend: "up",
      sparkline: [2, 3, 3, 4, 4, 5, 5],
    },
    {
      id: "project-open",
      moduleId: "project",
      title: "進行中任務",
      value: "18",
      unit: "項",
      change: "+4 本週",
      trend: "up",
      sparkline: [9, 11, 12, 14, 16, 17, 18],
    },
    {
      id: "knowledge-notes",
      moduleId: "knowledge",
      title: "新增知識",
      value: "9",
      unit: "筆",
      change: "+3 本週",
      trend: "up",
      sparkline: [2, 3, 5, 4, 6, 8, 9],
    },
    {
      id: "analytics-score",
      moduleId: "analytics",
      title: "資料完整度",
      value: "86",
      unit: "%",
      change: "+5% 較上週",
      trend: "up",
      sparkline: [68, 71, 74, 73, 80, 82, 86],
    },
  ],
  moduleWidgets: [
    {
      id: "care-overview",
      moduleId: "care",
      title: "長照模組概覽",
      metrics: [
        { label: "AA01 待處理", value: "3", tone: "danger" },
        { label: "FA310 待確認", value: "2", tone: "warning" },
        { label: "法規提醒", value: "1", tone: "info" },
      ],
    },
    {
      id: "finance-overview",
      moduleId: "finance",
      title: "記帳模組概覽",
      metrics: [
        { label: "今日支出", value: "$2,340", tone: "warning" },
        { label: "分類完成", value: "82%", tone: "success" },
        { label: "發票待確認", value: "5", tone: "info" },
      ],
    },
    {
      id: "project-progress",
      moduleId: "project",
      title: "專案管理概覽",
      metrics: [
        { label: "進行中任務", value: "18", tone: "info" },
        { label: "待審查", value: "4", tone: "warning" },
        { label: "本週完成", value: "7", tone: "success" },
      ],
    },
    {
      id: "knowledge-digest",
      moduleId: "knowledge",
      title: "知識管理概覽",
      metrics: [
        { label: "新筆記", value: "9", tone: "success" },
        { label: "待整理 URL", value: "6", tone: "warning" },
        { label: "PDF 摘要", value: "3", tone: "info" },
      ],
    },
    {
      id: "analytics-trend",
      moduleId: "analytics",
      title: "數據分析概覽",
      metrics: [
        { label: "資料完整度", value: "86%", tone: "success" },
        { label: "異常監測", value: "2", tone: "warning" },
        { label: "跨模組洞察", value: "5", tone: "info" },
      ],
    },
  ],
  eisenhowerQuadrants: [
    {
      id: "important-urgent",
      title: "重要且緊急",
      tasks: [
        { id: "task-aa01", moduleId: "care", title: "AA01 退件處理", priority: "高", due: "今日" },
        { id: "task-fa310", moduleId: "care", title: "FA310 需確認", priority: "高", due: "今日" },
        { id: "task-invoice", moduleId: "finance", title: "發票待確認", priority: "中", due: "今日" },
      ],
    },
    {
      id: "important-not-urgent",
      title: "重要但不緊急",
      tasks: [
        { id: "task-law", moduleId: "care", title: "法規更新閱讀", priority: "中", due: "本週" },
        { id: "task-monthly", moduleId: "finance", title: "月報分類檢查", priority: "中", due: "本週" },
        { id: "task-roadmap", moduleId: "project", title: "Roadmap 修訂", priority: "中", due: "週五" },
      ],
    },
    {
      id: "urgent-not-important",
      title: "緊急但不重要",
      tasks: [
        { id: "task-receipt", moduleId: "finance", title: "收據拍照補件", priority: "低", due: "今日" },
        { id: "task-commit", moduleId: "project", title: "Commit 摘要整理", priority: "低", due: "今日" },
      ],
    },
    {
      id: "not-important-not-urgent",
      title: "不重要不緊急",
      tasks: [
        { id: "task-url", moduleId: "knowledge", title: "網址收藏清理", priority: "低", due: "下週" },
        { id: "task-heatmap", moduleId: "analytics", title: "使用頻率 Heatmap", priority: "低", due: "下週" },
      ],
    },
  ],
  recentActivities: [
    { id: "activity-care-1", moduleId: "care", title: "AA01 新案：張○○ 計畫撰寫中", tag: "長照", time: "09:47" },
    { id: "activity-finance-1", moduleId: "finance", title: "發票 $236 已加入記帳", tag: "記帳", time: "10:25" },
    { id: "activity-care-2", moduleId: "care", title: "FA310 案例 #A125 退件", tag: "長照", time: "09:15" },
    { id: "activity-project-1", moduleId: "project", title: "Dashboard Prototype 任務已更新", tag: "專案", time: "08:40" },
    { id: "activity-knowledge-1", moduleId: "knowledge", title: "長照給付文件已完成摘要", tag: "知識", time: "昨日" },
    { id: "activity-analytics-1", moduleId: "analytics", title: "模組使用趨勢已重新整理", tag: "分析", time: "昨日" },
  ],
  quickActions: [
    { id: "qa-care-case", moduleId: "care", label: "新增案件", description: "建立 AA01 / FA310 工作項" },
    { id: "qa-care-code", moduleId: "care", label: "服務碼查詢", description: "快速查找長照支付項目" },
    { id: "qa-finance-expense", moduleId: "finance", label: "記帳", description: "新增支出或收入紀錄" },
    { id: "qa-finance-invoice", moduleId: "finance", label: "確認發票", description: "處理待分類發票" },
    { id: "qa-project-task", moduleId: "project", label: "建立任務", description: "加入專案工作板" },
    { id: "qa-knowledge-note", moduleId: "knowledge", label: "新增筆記", description: "整理文件或網址" },
    { id: "qa-analytics-trend", moduleId: "analytics", label: "檢視趨勢", description: "開啟跨模組分析" },
  ],
  chartSeries: [
    {
      id: "care-case-trend",
      moduleId: "care",
      label: "派案量",
      color: "#22C55E",
      points: [
        { label: "一", value: 8 },
        { label: "二", value: 11 },
        { label: "三", value: 10 },
        { label: "四", value: 13 },
        { label: "五", value: 12 },
      ],
    },
    {
      id: "finance-spend-trend",
      moduleId: "finance",
      label: "支出",
      color: "#F59E0B",
      points: [
        { label: "一", value: 26 },
        { label: "二", value: 23 },
        { label: "三", value: 28 },
        { label: "四", value: 20 },
        { label: "五", value: 18 },
      ],
    },
    {
      id: "analytics-quality-trend",
      moduleId: "analytics",
      label: "完整度",
      color: "#06B6D4",
      points: [
        { label: "一", value: 70 },
        { label: "二", value: 73 },
        { label: "三", value: 78 },
        { label: "四", value: 82 },
        { label: "五", value: 86 },
      ],
    },
  ],
  donutSlices: [
    { id: "donut-care", moduleId: "care", label: "長照", value: 42, color: "#22C55E" },
    { id: "donut-finance", moduleId: "finance", label: "記帳", value: 28, color: "#F59E0B" },
    { id: "donut-project", moduleId: "project", label: "專案", value: 14, color: "#3B82F6" },
    { id: "donut-knowledge", moduleId: "knowledge", label: "知識", value: 9, color: "#8B5CF6" },
    { id: "donut-analytics", moduleId: "analytics", label: "分析", value: 7, color: "#06B6D4" },
  ],
  aiSuggestion: {
    status: "AI 已完成分析",
    confidence: "信心度 82%，仍建議人工確認",
    summary:
      "根據今日資料，建議優先處理 AA01 退件原因相似案件，並確認 FA310 待確認項目。",
    recommendedActions: ["比對 AA01 退件原因", "確認 FA310 欄位", "檢查發票分類"],
  },
};
