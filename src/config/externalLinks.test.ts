import { describe, expect, it } from "vitest";
import { externalLinks } from "./externalLinks";
import linksJson from "../../config/external-links.json";

describe("externalLinks (single machine-readable source)", () => {
  it("reads from config/external-links.json (no hardcoded duplicates)", () => {
    expect(externalLinks.onedrive.sharedFolder).toBe(
      linksJson.onedrive.sharedFolder
    );
    expect(externalLinks.googleAppsScript.visitManager).toBe(
      linksJson.googleAppsScript.visitManager
    );
    expect(externalLinks.googleAppsScript.dispatchConsole).toBe(
      linksJson.googleAppsScript.dispatchConsole
    );
  });

  it("exposes the expected link groups as URLs", () => {
    expect(externalLinks.googleAppsScript.visitManager).toContain(
      "script.google.com"
    );
    expect(externalLinks.github.knowledge).toMatch(/^https?:\/\//);
    expect(externalLinks.github.aa01).toMatch(/^https?:\/\//);
  });
});
