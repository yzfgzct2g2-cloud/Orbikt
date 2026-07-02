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
  id: string; // 案號 (business case number, not the national ID)
  name: string;
  managerId: string;
  cmsLevel: number | null; // CMS 2–8, or null when not yet assessed
  status: CaseStatus;
  visit: VisitInfo;
  dispatch: DispatchInfo;
  aa01Status: ModuleStatus;
  fa310Status: ModuleStatus;
  tags: string[];
  updatedAt: string; // ISO datetime

  // Case master fields sourced from CS100 (national ID / phone / street
  // address are intentionally omitted — see scripts/cs100Normalize.mjs).
  age?: number | null;
  welfare?: string; // 福利身分
  area?: string; // 居住地（縣市/區）
  village?: string; // 居住地（里）
  openDate?: string | null; // 開案日期 (ISO)
  assessmentDate?: string | null; // 評估日期 (ISO)
  serviceItemCount?: number | null; // 服務項目數
  careCenter?: string; // 照管中心
  govAssessor?: string; // 照管專員（照管中心，非 A 單位個管員）
  aUnit?: string; // A 單位名稱
  serviceCodes?: string; // 服務代碼

  // Masked national ID for display/search only, e.g. "A*****6789". The RAW
  // national ID is read transiently in the import script and is NEVER stored
  // here, in the seed JSON, logs, timeline, UI, or tests. See cs100Normalize.mjs.
  maskedNationalId?: string | null;
  // Optional salted hash for import-time matching against company records.
  // Only present when a build-time salt (ORBIKT_ID_SALT) is supplied; the raw
  // ID is not recoverable without that salt. Never used to display anything.
  idLookupHash?: string;
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

export type ScheduleKind = "visit" | "meeting" | "review" | "personal";

/**
 * A calendar event. Modeled ICS/Google-Calendar-ready (start/end ISO datetimes)
 * so the mock schedule can be swapped for a real Calendar adapter without
 * changing the UI. SSOT for visit *warnings* remains Visit Manager; a scheduled
 * visit here is a calendar entry, not a warning recalculation.
 */
export interface ScheduleEvent {
  id: string;
  caseId: string | null;
  title: string;
  start: string; // ISO datetime
  end: string | null; // ISO datetime
  kind: ScheduleKind;
  location?: string;
}
