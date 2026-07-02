import { describe, expect, it } from "vitest";
import { reviewFromStatus, reviewManager } from "./reviewEngine";
import { MockReviewAdapter } from "./reviewAdapter";

describe("reviewFromStatus (FA310 result representation, not rules)", () => {
  it("maps approved -> pass with no findings", () => {
    const r = reviewFromStatus("C-1", "approved");
    expect(r.outcome).toBe("pass");
    expect(r.findings).toHaveLength(0);
    expect(r.domain).toBe("fa310");
  });

  it("maps returned -> returned with an Evidence-First finding", () => {
    const r = reviewFromStatus("C-1", "returned");
    expect(r.outcome).toBe("returned");
    expect(r.findings.length).toBeGreaterThan(0);
    for (const f of r.findings) {
      // Evidence-First: location + issue + evidence + confidence required.
      expect(f.location.columnLetter).toBe("L");
      expect(f.issue.length).toBeGreaterThan(0);
      expect(f.evidence.length).toBeGreaterThan(0);
      expect(f.confidence).toBeGreaterThan(0);
      expect(f.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("maps submitted/in_progress -> in_review, and draft/not_started -> pending", () => {
    expect(reviewFromStatus("C-1", "submitted").outcome).toBe("in_review");
    expect(reviewFromStatus("C-1", "in_progress").outcome).toBe("in_review");
    expect(reviewFromStatus("C-1", "draft").outcome).toBe("pending");
    expect(reviewFromStatus("C-1", "not_started").outcome).toBe("pending");
  });

  it("reports the QA Engine as the source (rules not in React)", () => {
    expect(reviewManager.mode).toBe("adapter");
    expect(reviewManager.engine).toContain("LongCare-QA-Engine");
  });
});

describe("MockReviewAdapter", () => {
  const adapter = new MockReviewAdapter();

  it("returns null for an unknown case", async () => {
    expect(await adapter.getReview("C-9999")).toBeNull();
  });

  it("returns a case-bound review for a known case", async () => {
    const r = await adapter.getReview("C-0001");
    expect(r?.caseId).toBe("C-0001");
    expect(["pass", "returned", "in_review", "pending"]).toContain(r?.outcome);
  });
});
