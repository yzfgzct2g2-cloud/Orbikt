import { describe, expect, it } from "vitest";
import {
  availableDocumentLinks,
  caseAttachmentLink,
  documentShortcuts,
  documentsManager,
} from "./documents";
import type { CaseRecord } from "../../adapters/types";

const sample: CaseRecord = {
  id: "C-0007",
  name: "測試",
  managerId: "cm-001",
  cmsLevel: 4,
  status: "active",
  visit: {
    lastVisitDate: null,
    nextDueDate: null,
    remainingDays: null,
    status: "normal",
  },
  dispatch: { status: "accepted", updatedAt: "2026-07-02T09:00:00+08:00" },
  aa01Status: "not_started",
  fa310Status: "not_started",
  tags: [],
  updatedAt: "2026-07-02T09:00:00+08:00",
};

describe("documents module", () => {
  it("is OneDrive link-first (Graph deferred)", () => {
    expect(documentsManager.status).toBe("v1_link_only");
  });

  it("exposes the shared folder as an available link", () => {
    const links = availableDocumentLinks();
    expect(links.length).toBeGreaterThan(0);
    for (const l of links) {
      expect(l.url).toMatch(/^https?:\/\//);
    }
    expect(links.some((l) => l.id === "shared-a-cm")).toBe(true);
  });

  it("surfaces pending shortcuts honestly (null url)", () => {
    const pending = documentShortcuts.filter((s) => s.url === null);
    expect(pending.length).toBeGreaterThan(0);
  });

  it("builds a case attachment link bound to the case (folder pending)", () => {
    const a = caseAttachmentLink(sample);
    expect(a.label).toContain("C-0007");
    expect(a.url).toMatch(/^https?:\/\//);
    expect(a.pendingCaseFolder).toBe(true);
  });
});
