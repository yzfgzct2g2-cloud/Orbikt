// Document Center module — OneDrive link-first (V1). Microsoft Graph API is
// deferred to V1.1 (see config/integrations.json onedrive.status = v1_link_only).
// Some shortcut URLs are not yet provided in config/external-links.md; those are
// surfaced honestly as "pending" rather than hidden or faked.

import type { CaseRecord, DocumentLink } from "../../adapters/types";
import { externalLinks } from "../../config/externalLinks";
import { integrations } from "../../config/appConfig";

export type DocumentCategory =
  | "shared"
  | "template"
  | "regulation"
  | "form"
  | "training";

export interface DocumentShortcut {
  id: string;
  label: string;
  category: DocumentCategory;
  url: string | null; // null = link not yet provided
}

export const documentsManager = {
  source: "OneDrive 共用資料夾",
  status: integrations.onedrive.status, // "v1_link_only"
  note: "V1 以 OneDrive 共用資料夾捷徑為主；Microsoft Graph API 留待 V1.1。",
};

// Authoring source of truth for links: config/external-links.md. Only the shared
// A個管 folder has a URL today; the rest are pending until provided.
export const documentShortcuts: DocumentShortcut[] = [
  {
    id: "shared-a-cm",
    label: "個管共用資料夾（A個管）",
    category: "shared",
    url: externalLinks.onedrive.sharedFolder,
  },
  { id: "aa01-templates", label: "AA01 範本", category: "template", url: null },
  { id: "regulations", label: "法規資料", category: "regulation", url: null },
  { id: "forms", label: "常用表單", category: "form", url: null },
  { id: "training", label: "教育訓練", category: "training", url: null },
];

export const documentCategoryLabel: Record<DocumentCategory, string> = {
  shared: "共用資料夾",
  template: "範本",
  regulation: "法規資料",
  form: "常用表單",
  training: "教育訓練",
};

/** Available shortcuts as DocumentLink[] (used by the Command Center card). */
export function availableDocumentLinks(): DocumentLink[] {
  return documentShortcuts
    .filter((s): s is DocumentShortcut & { url: string } => s.url !== null)
    .map((s) => ({
      id: s.id,
      label: s.label,
      url: s.url,
      scope: s.category === "shared" ? "shared" : "template",
    }));
}

/**
 * Per-case attachment shortcut. A dedicated per-case folder URL is not yet
 * configured (external-links.md「個案附件根目錄」為空），so V1 links to the
 * shared A個管 folder with the case as context.
 */
export function caseAttachmentLink(c: CaseRecord): {
  label: string;
  url: string;
  pendingCaseFolder: boolean;
} {
  return {
    label: `${c.name}（${c.id}）附件 · 個管共用資料夾`,
    url: externalLinks.onedrive.sharedFolder,
    pendingCaseFolder: true,
  };
}
