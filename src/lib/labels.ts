// Display labels (Traditional Chinese) and badge styles for domain statuses.
// Centralised so every surface (Command Center, Cases, Workspace) shows the
// same wording for the same status.

import type {
  CalendarEventSource,
  CalendarEventStatus,
  CalendarEventType,
  CaseStatus,
  DispatchStatus,
  ModuleStatus,
  VisitStatus,
} from "../adapters/types";

export const visitStatusLabel: Record<VisitStatus, string> = {
  normal: "正常",
  within_60: "60 日內",
  within_30: "30 日內",
  overdue: "已逾期",
  scheduled: "已排程",
  completed: "已完成",
};

export const visitStatusClass: Record<VisitStatus, string> = {
  normal: "bg-slate-100 text-slate-600",
  within_60: "bg-amber-100 text-amber-700",
  within_30: "bg-orange-100 text-orange-700",
  overdue: "bg-red-100 text-red-700",
  scheduled: "bg-sky-100 text-sky-700",
  completed: "bg-emerald-100 text-emerald-700",
};

export const dispatchStatusLabel: Record<DispatchStatus, string> = {
  dispatching: "派案中",
  waiting: "等待回覆",
  timeout: "Timeout 即將到期",
  accepted: "已接受",
  no_capacity: "全數無人力",
  manual_required: "人工介入",
  closed: "已完成",
};

export const dispatchStatusClass: Record<DispatchStatus, string> = {
  dispatching: "bg-sky-100 text-sky-700",
  waiting: "bg-amber-100 text-amber-700",
  timeout: "bg-orange-100 text-orange-700",
  accepted: "bg-emerald-100 text-emerald-700",
  no_capacity: "bg-red-100 text-red-700",
  manual_required: "bg-purple-100 text-purple-700",
  closed: "bg-slate-100 text-slate-600",
};

export const moduleStatusLabel: Record<ModuleStatus, string> = {
  not_started: "未開始",
  draft: "草稿",
  in_progress: "進行中",
  submitted: "已送審",
  approved: "已通過",
  returned: "已退件",
};

export const moduleStatusClass: Record<ModuleStatus, string> = {
  not_started: "bg-slate-100 text-slate-500",
  draft: "bg-slate-100 text-slate-600",
  in_progress: "bg-sky-100 text-sky-700",
  submitted: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  returned: "bg-red-100 text-red-700",
};

export const caseStatusLabel: Record<CaseStatus, string> = {
  active: "服務中",
  pending: "待啟動",
  suspended: "暫停",
  closed: "結案",
};

// --- Team Calendar (團隊行事曆) --------------------------------------------

export const calendarTypeLabel: Record<CalendarEventType, string> = {
  visit: "家訪",
  reassessment: "複評",
  "care-plan": "照顧計畫",
  dispatch: "派案",
  meeting: "會議",
  administrative: "行政",
  training: "教育訓練",
  leave: "請假",
  other: "其他",
};

export const calendarTypeClass: Record<CalendarEventType, string> = {
  visit: "bg-orange-100 text-orange-700",
  reassessment: "bg-violet-100 text-violet-700",
  "care-plan": "bg-teal-100 text-teal-700",
  dispatch: "bg-sky-100 text-sky-700",
  meeting: "bg-blue-100 text-blue-700",
  administrative: "bg-slate-100 text-slate-600",
  training: "bg-emerald-100 text-emerald-700",
  leave: "bg-amber-100 text-amber-700",
  other: "bg-slate-100 text-slate-500",
};

export const calendarStatusLabel: Record<CalendarEventStatus, string> = {
  scheduled: "已排定",
  "in-progress": "進行中",
  completed: "已完成",
  overdue: "逾期",
  cancelled: "已取消",
};

export const calendarStatusClass: Record<CalendarEventStatus, string> = {
  scheduled: "bg-sky-100 text-sky-700",
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
};

export const calendarSourceLabel: Record<CalendarEventSource, string> = {
  manual: "手動建立",
  "visit-manager": "Visit Manager",
  aa01: "AA01",
  fa310: "FA310",
  dispatch: "派案系統",
  system: "系統",
};
