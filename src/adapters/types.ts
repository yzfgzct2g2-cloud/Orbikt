// Orbikt domain model.
//
// These types are the shared contract between the data adapters (mock today,
// Supabase / Google Apps Script / Microsoft Graph later) and the UI. The UI
// must depend on this contract only, never on a concrete data source. This is
// what keeps Single Source of Truth intact across integrations.

export type Role = "case_manager" | "supervisor" | "director" | "admin";

export interface Manager {
  id: string;
  name: string;
  role: Role;
  caseload: number;
}

/** Visit warning status. SSOT = Visit Manager (Google Apps Script). */
export type VisitStatus =
  | "normal"
  | "within_60"
  | "within_30"
  | "overdue"
  | "scheduled"
  | "completed";

/** Dispatch status. SSOT = external Dispatch console/API. */
export type DispatchStatus =
  | "dispatching"
  | "waiting"
  | "timeout"
  | "accepted"
  | "no_capacity"
  | "manual_required"
  | "closed";

/** Generic module review/authoring status (AA01 Planner, FA310 Review). */
export type ModuleStatus =
  | "not_started"
  | "draft"
  | "in_progress"
  | "submitted"
  | "approved"
  | "returned";

export type CaseStatus = "active" | "pending" | "suspended" | "closed";

/**
 * Visit warning info as reported BY Visit Manager. Orbikt reads these fields;
 * it never recomputes `remainingDays` or `status` from dates. See DECISIONS.md.
 */
export interface VisitInfo {
  lastVisitDate: string | null; // ISO date
  nextDueDate: string | null; // ISO date
  remainingDays: number | null;
  status: VisitStatus;
}

export interface DispatchInfo {
  status: DispatchStatus;
  updatedAt: string; // ISO datetime
}

export interface CaseRecord {
  id: string;
  name: string;
  managerId: string;
  cmsLevel: number; // CMS 2–8
  status: CaseStatus;
  visit: VisitInfo;
  dispatch: DispatchInfo;
  aa01Status: ModuleStatus;
  fa310Status: ModuleStatus;
  tags: string[];
  updatedAt: string; // ISO datetime
}

export type TaskType = "visit" | "review" | "dispatch" | "document" | "general";

export interface TaskItem {
  id: string;
  caseId: string | null;
  title: string;
  due: string; // ISO date
  type: TaskType;
  done: boolean;
}

export type NotificationKind = "visit" | "dispatch" | "review" | "system";

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string; // ISO datetime
  read: boolean;
  caseId: string | null;
}

export type TimelineType =
  | "case"
  | "aa01"
  | "fa310"
  | "dispatch"
  | "visit"
  | "document";

export interface TimelineEvent {
  id: string;
  caseId: string;
  at: string; // ISO datetime
  type: TimelineType;
  summary: string;
}

export type DocumentScope = "shared" | "case" | "template" | "training";

export interface DocumentLink {
  id: string;
  label: string;
  url: string;
  scope: DocumentScope;
}
