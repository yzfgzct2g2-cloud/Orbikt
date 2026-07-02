// Cs100DataAdapter — V1 DataAdapter backed by the sanitized CS100 seed.
//
// Case master data comes from src/data/seed/cases.generated.json (built from
// mock-data/CS100.xlsx by scripts/buildCaseSeed.mjs; PII stripped). Tasks,
// notifications, and timeline are DERIVED from the case set so every reference
// points at a real case id — no hand-maintained fixtures to drift.
//
// SSOT is respected: getVisit / getDispatch are read-only pass-throughs. When
// Visit Manager (Phase 5) and Dispatch (Phase 6) are wired, only the seed
// values change; this adapter and the UI stay the same.

import type { DataAdapter } from "./DataAdapter";
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
import seed from "../data/seed/cases.generated.json";
import { externalLinks } from "../config/externalLinks";

const SEED_TODAY = "2026-07-02";

const cases: CaseRecord[] = seed as CaseRecord[];

function clone<T>(value: T): T {
  return structuredClone(value);
}

// --- Derivations (deterministic; presentation aggregation, not SSOT logic) ---

interface RankedTask extends TaskItem {
  rank: number;
}

function deriveTasks(all: CaseRecord[]): TaskItem[] {
  const out: RankedTask[] = [];
  for (const c of all) {
    if (c.visit.status === "overdue") {
      out.push({
        id: `T-${c.id}-visit`,
        caseId: c.id,
        title: `${c.name} 家訪逾期（剩 ${c.visit.remainingDays} 天）`,
        due: c.visit.nextDueDate ?? SEED_TODAY,
        type: "visit",
        done: false,
        rank: 0,
      });
    } else if (c.visit.status === "within_30") {
      out.push({
        id: `T-${c.id}-visit`,
        caseId: c.id,
        title: `${c.name} 家訪 30 日內到期`,
        due: c.visit.nextDueDate ?? SEED_TODAY,
        type: "visit",
        done: false,
        rank: 5,
      });
    }
    if (c.dispatch.status === "timeout") {
      out.push({
        id: `T-${c.id}-dispatch`,
        caseId: c.id,
        title: `${c.name} 派案 Timeout，需確認`,
        due: SEED_TODAY,
        type: "dispatch",
        done: false,
        rank: 1,
      });
    } else if (c.dispatch.status === "manual_required") {
      out.push({
        id: `T-${c.id}-dispatch`,
        caseId: c.id,
        title: `${c.name} 派案需人工介入`,
        due: SEED_TODAY,
        type: "dispatch",
        done: false,
        rank: 2,
      });
    }
    if (c.fa310Status === "returned") {
      out.push({
        id: `T-${c.id}-fa310`,
        caseId: c.id,
        title: `${c.name} FA310 退件修正`,
        due: SEED_TODAY,
        type: "review",
        done: false,
        rank: 3,
      });
    }
  }
  return out
    .sort((a, b) => a.rank - b.rank || (a.due < b.due ? -1 : 1))
    .slice(0, 15)
    .map((t) => ({
      id: t.id,
      caseId: t.caseId,
      title: t.title,
      due: t.due,
      type: t.type,
      done: t.done,
    }));
}

function deriveNotifications(all: CaseRecord[]): NotificationItem[] {
  const out: NotificationItem[] = [];
  for (const c of all) {
    if (c.visit.status === "overdue") {
      out.push({
        id: `N-${c.id}-visit`,
        kind: "visit",
        title: "家訪逾期警戒",
        body: `${c.name}（${c.id}）家訪已逾期 ${Math.abs(
          c.visit.remainingDays ?? 0
        )} 天。`,
        createdAt: `${c.visit.nextDueDate ?? SEED_TODAY}T08:00:00+08:00`,
        read: false,
        caseId: c.id,
      });
    }
    if (c.dispatch.status === "timeout" || c.dispatch.status === "no_capacity") {
      out.push({
        id: `N-${c.id}-dispatch`,
        kind: "dispatch",
        title: c.dispatch.status === "timeout" ? "派案 Timeout" : "全數無人力",
        body: `${c.name}（${c.id}）派案狀態需關注。`,
        createdAt: c.dispatch.updatedAt,
        read: false,
        caseId: c.id,
      });
    }
    if (c.fa310Status === "returned") {
      out.push({
        id: `N-${c.id}-fa310`,
        kind: "review",
        title: "FA310 退件",
        body: `${c.name}（${c.id}）FA310 審查退件，欄位 L 有修正建議。`,
        createdAt: c.dispatch.updatedAt,
        read: false,
        caseId: c.id,
      });
    }
  }
  const sorted = out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 12);
  // Older notifications default to read so the unread badge stays meaningful.
  return sorted.map((n, i) => (i < 5 ? n : { ...n, read: true }));
}

/**
 * Build the schedule for a given day. Two standing team meetings plus a visit
 * entry for every case whose next visit falls on that day. This is a mock
 * Calendar source (ICS-ready shape); a real Google Calendar / ICS adapter can
 * replace it without UI changes.
 */
function deriveSchedule(all: CaseRecord[], dayISO: string): ScheduleEvent[] {
  const events: ScheduleEvent[] = [
    {
      id: `S-${dayISO}-standup`,
      caseId: null,
      title: "個管晨會",
      start: `${dayISO}T09:00:00+08:00`,
      end: `${dayISO}T09:30:00+08:00`,
      kind: "meeting",
    },
    {
      id: `S-${dayISO}-review`,
      caseId: null,
      title: "個案研討會",
      start: `${dayISO}T14:00:00+08:00`,
      end: `${dayISO}T15:00:00+08:00`,
      kind: "review",
    },
  ];
  for (const c of all) {
    if (c.visit.nextDueDate === dayISO) {
      events.push({
        id: `S-${dayISO}-${c.id}`,
        caseId: c.id,
        title: `${c.name} 家訪`,
        start: `${dayISO}T10:00:00+08:00`,
        end: `${dayISO}T11:00:00+08:00`,
        kind: "visit",
        location: c.area,
      });
    }
  }
  return events.sort((a, b) => (a.start < b.start ? -1 : 1));
}

function deriveTimeline(c: CaseRecord): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  if (c.openDate) {
    events.push({
      id: `E-${c.id}-open`,
      caseId: c.id,
      at: `${c.openDate}T09:00:00+08:00`,
      type: "case",
      summary: "開案，建立個案。",
    });
  }
  if (c.assessmentDate) {
    events.push({
      id: `E-${c.id}-assess`,
      caseId: c.id,
      at: `${c.assessmentDate}T09:00:00+08:00`,
      type: "case",
      summary: "完成評估。",
    });
  }
  if (c.visit.lastVisitDate) {
    events.push({
      id: `E-${c.id}-visit`,
      caseId: c.id,
      at: `${c.visit.lastVisitDate}T10:00:00+08:00`,
      type: "visit",
      summary: `完成家訪，下次到期 ${c.visit.nextDueDate ?? "—"}。`,
    });
  }
  events.push({
    id: `E-${c.id}-dispatch`,
    caseId: c.id,
    at: c.dispatch.updatedAt,
    type: "dispatch",
    summary: "派案狀態更新。",
  });
  return events.sort((a, b) => (a.at < b.at ? 1 : -1));
}

export class Cs100DataAdapter implements DataAdapter {
  readonly kind = "mock" as const;

  async listCases(): Promise<CaseRecord[]> {
    return clone(cases);
  }

  async getCase(caseId: string): Promise<CaseRecord | null> {
    const found = cases.find((c) => c.id === caseId);
    return found ? clone(found) : null;
  }

  async getVisit(caseId: string): Promise<VisitInfo | null> {
    // SSOT = Visit Manager. Read-only pass-through.
    const found = cases.find((c) => c.id === caseId);
    return found ? clone(found.visit) : null;
  }

  async getDispatch(caseId: string): Promise<DispatchInfo | null> {
    // SSOT = external Dispatch system. Read-only.
    const found = cases.find((c) => c.id === caseId);
    return found ? clone(found.dispatch) : null;
  }

  async listTasks(): Promise<TaskItem[]> {
    return deriveTasks(cases);
  }

  async listNotifications(): Promise<NotificationItem[]> {
    return deriveNotifications(cases);
  }

  async listDocuments(): Promise<DocumentLink[]> {
    return [
      {
        id: "D-01",
        label: "個管共用資料夾（A個管）",
        url: externalLinks.onedrive.sharedFolder,
        scope: "shared",
      },
    ];
  }

  async listSchedule(dayISO: string = SEED_TODAY): Promise<ScheduleEvent[]> {
    return deriveSchedule(cases, dayISO);
  }

  async listTimeline(caseId: string): Promise<TimelineEvent[]> {
    const found = cases.find((c) => c.id === caseId);
    return found ? deriveTimeline(found) : [];
  }
}
