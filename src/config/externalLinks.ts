// External links — read from the single machine-readable source of truth
// (config/external-links.json). Do NOT hardcode URLs here; edit the JSON.
// config/external-links.md is the human-readable companion.

import linksJson from "../../config/external-links.json";

export interface ExternalLinks {
  onedrive: { sharedFolder: string };
  googleAppsScript: { visitManager: string; dispatchConsole: string };
  github: {
    orbikt: string;
    aa01: string;
    knowledge: string;
    qaEngine: string;
    authTest: string;
  };
}

export const externalLinks: ExternalLinks = linksJson as ExternalLinks;
