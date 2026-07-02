import { describe, expect, it } from "vitest";
import {
  knowledgeTopics,
  relatedTopics,
  searchTopics,
  knowledgeManager,
} from "./knowledge";
import type { CaseRecord } from "../../adapters/types";

function caseWithTags(tags: string[]): CaseRecord {
  return {
    id: "C-0001",
    name: "測試",
    managerId: "cm-001",
    cmsLevel: 5,
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
    tags,
    updatedAt: "2026-07-02T09:00:00+08:00",
  };
}

describe("knowledge module", () => {
  it("loads the real practical topics with traceable ids", () => {
    expect(knowledgeTopics.length).toBe(21);
    for (const t of knowledgeTopics) {
      expect(t.id).toMatch(/^topic-\d+/);
      expect(t.title.length).toBeGreaterThan(0);
    }
  });

  it("searches by title, keyword, or service code", () => {
    expect(searchTopics("外籍看護").length).toBeGreaterThan(0);
    expect(searchTopics("BA09").some((t) => t.relatedCodes.includes("BA09"))).toBe(
      true
    );
    expect(searchTopics("").length).toBe(21);
  });

  it("returns case-relevant topics (tags matched + baseline planning topics)", () => {
    const refs = relatedTopics(caseWithTags(["外籍看護", "交通從優"]));
    const ids = refs.map((t) => t.id);
    expect(ids.some((id) => id.includes("外籍看護"))).toBe(true);
    expect(ids.some((id) => id.includes("交通"))).toBe(true);
    // baseline: AA01 planning + CMS level always present
    expect(ids).toContain("topic-019-AA01照顧計畫");
    expect(ids).toContain("topic-012-CMS等級");
  });

  it("requires citation of the knowledge base", () => {
    expect(knowledgeManager.note).toContain("引用");
  });
});
