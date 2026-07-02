// Review adapter — fetches the FA310 review result for a case. V1 uses the
// mock (maps the case's stored fa310Status via the engine seam). A live adapter
// would call the LongCare-QA-Engine (HTTP/CLI) and return the same ReviewResult.

import { dataAdapter } from "../../adapters";
import { reviewFromStatus } from "./reviewEngine";
import type { ReviewResult } from "./reviewTypes";

export interface ReviewAdapter {
  readonly kind: "mock" | "live";
  getReview(caseId: string): Promise<ReviewResult | null>;
}

export class MockReviewAdapter implements ReviewAdapter {
  readonly kind = "mock" as const;

  async getReview(caseId: string): Promise<ReviewResult | null> {
    const c = await dataAdapter.getCase(caseId);
    if (!c) return null;
    // "generatedAt" mirrors when a review would have run; use the case's
    // last update as a stand-in so the UI can show a timestamp.
    const generatedAt =
      c.fa310Status === "not_started" || c.fa310Status === "draft"
        ? null
        : c.updatedAt;
    return reviewFromStatus(caseId, c.fa310Status, generatedAt);
  }
}

export const reviewAdapter: ReviewAdapter = new MockReviewAdapter();
