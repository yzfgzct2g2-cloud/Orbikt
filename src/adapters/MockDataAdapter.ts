// MockDataAdapter — V1 in-memory implementation of DataAdapter.
//
// Everything resolves via Promise so the async contract matches the future
// networked adapters (Supabase / GAS / Dispatch API). No business logic is
// invented here: visit and dispatch values are returned exactly as stored in
// the mock case records (which stand in for their owning systems' output).

import type { DataAdapter } from "./DataAdapter";
import type {
  CaseRecord,
  DispatchInfo,
  DocumentLink,
  NotificationItem,
  TaskItem,
  TimelineEvent,
  VisitInfo,
} from "./types";
import { mockCases } from "../data/mock/cases";
import {
  mockDocuments,
  mockNotifications,
  mockTasks,
  mockTimeline,
} from "../data/mock/activity";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class MockDataAdapter implements DataAdapter {
  readonly kind = "mock" as const;

  async listCases(): Promise<CaseRecord[]> {
    return clone(mockCases);
  }

  async getCase(caseId: string): Promise<CaseRecord | null> {
    const found = mockCases.find((c) => c.id === caseId);
    return found ? clone(found) : null;
  }

  async getVisit(caseId: string): Promise<VisitInfo | null> {
    // SSOT = Visit Manager. Read-only pass-through of the stored result.
    const found = mockCases.find((c) => c.id === caseId);
    return found ? clone(found.visit) : null;
  }

  async getDispatch(caseId: string): Promise<DispatchInfo | null> {
    // SSOT = external Dispatch system. Read-only.
    const found = mockCases.find((c) => c.id === caseId);
    return found ? clone(found.dispatch) : null;
  }

  async listTasks(): Promise<TaskItem[]> {
    return clone(mockTasks);
  }

  async listNotifications(): Promise<NotificationItem[]> {
    return clone(mockNotifications);
  }

  async listDocuments(): Promise<DocumentLink[]> {
    return clone(mockDocuments);
  }

  async listTimeline(caseId: string): Promise<TimelineEvent[]> {
    return clone(
      mockTimeline
        .filter((e) => e.caseId === caseId)
        .sort((a, b) => (a.at < b.at ? 1 : -1))
    );
  }
}
