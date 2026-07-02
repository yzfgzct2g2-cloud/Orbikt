import { describe, expect, it } from "vitest";
import { genogram, genogramIntegrationSteps } from "./genogram";

describe("genogram module", () => {
  it("is a prototype placeholder, not invented logic", () => {
    expect(genogram.status).toBe("prototype");
    expect(genogram.mode).toBe("placeholder");
  });

  it("lists the remaining integration steps honestly", () => {
    expect(genogramIntegrationSteps.length).toBeGreaterThan(0);
    expect(genogramIntegrationSteps.join(" ")).toContain("Case ID");
  });
});
