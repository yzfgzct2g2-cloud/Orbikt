// DataAdapter — the single seam between Orbikt's UI and its data sources.
//
// V1 ships a MockDataAdapter (local, in-memory). The architecture reserves
// space for Supabase, Google Apps Script (Visit Manager), the Dispatch API,
// Microsoft Graph, and Google Calendar. Swapping data sources means providing
// a new implementation of this interface — no UI changes required.
//
// SSOT rules enforced here:
//   • Visit warnings come FROM Visit Manager. The adapter reads them; it never
//     recomputes remaining days or warning status.
//   • Dispatch status comes FROM the external Dispatch system. Read-only in V1.

import type {
  CaseRecord,
  DispatchInfo,
  DocumentLink,
  NotificationItem,
  ScheduleEvent,
  TaskItem,
  TimelineEvent,
  VisitInfo,
} from "./types";

export interface DataAdapter {
  readonly kind: "mock" | "supabase" | "live";

  // Cases
  listCases(): Promise<CaseRecord[]>;
  getCase(caseId: string): Promise<CaseRecord | null>;

  // Visit Manager (SSOT = Google Apps Script). Read-only pass-through.
  getVisit(caseId: string): Promise<VisitInfo | null>;

  // Dispatch (SSOT = external console/API). Read-only in V1.
  getDispatch(caseId: string): Promise<DispatchInfo | null>;

  // Command Center / cross-case
  listTasks(): Promise<TaskItem[]>;
  // Workspace: open tasks for a single case (uncapped).
  listCaseTasks(caseId: string): Promise<TaskItem[]>;
  listNotifications(): Promise<NotificationItem[]>;
  listDocuments(): Promise<DocumentLink[]>;

  // Calendar (Google Calendar / ICS-ready). `dayISO` defaults to "today".
  listSchedule(dayISO?: string): Promise<ScheduleEvent[]>;

  // Workspace
  listTimeline(caseId: string): Promise<TimelineEvent[]>;
}
