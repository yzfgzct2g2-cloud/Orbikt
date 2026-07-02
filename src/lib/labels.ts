// Display labels (Traditional Chinese) and badge styles for domain statuses.
// Centralised so every surface (Command Center, Cases, Workspace) shows the
// same wording for the same status.

import type {
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
