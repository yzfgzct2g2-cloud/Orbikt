// Knowledge module — surfaces the long-term-care knowledge with traceable
// sources. SSOT = the knowledge platform (source-systems/knowledge, 7 layers).
// Orbikt keeps the source ids (topic id, related codes/articles) so every
// reference links back and any AI answer can cite the knowledge base.

import type { CaseRecord } from "../../adapters/types";
import { externalLinks } from "../../config/externalLinks";
import topicsJson from "./topics.generated.json";

export interface KnowledgeTopic {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  relatedCodes: string[];
  relatedArticles: number[];
}

export const knowledgeTopics: KnowledgeTopic[] = topicsJson as KnowledgeTopic[];

export const knowledgeManager = {
  source: "長照法規知識平台 · 7 層知識架構",
  url: externalLinks.github.knowledge,
  note: "所有 AI 回答必須引用知識來源；引用保留可追溯 id（主題 / 服務代碼 / 條文）。",
};

// The 7 knowledge layers (from source-systems/knowledge/ARCHITECTURE.md).
export const knowledgeLayers = [
  { id: 1, name: "Regulations 正式法規", desc: "條文、附表、逐條說明", priority: "100" },
  { id: 2, name: "Interpretations 函釋", desc: "函釋、公告、行政解釋", priority: "90" },
  { id: 3, name: "Rule Engine 規則引擎", desc: "規則、例外、限制、額度", priority: "85" },
  { id: 4, name: "Practical Topics 實務主題", desc: "21 個實務主題整理", priority: "80" },
  { id: 5, name: "Assistive Devices 輔具", desc: "長照／身障／醫療輔具 93 項", priority: "80" },
  { id: 6, name: "Cases 匿名案例", desc: "去識別化實務案例", priority: "70" },
  { id: 7, name: "Knowledge Graph 知識關聯", desc: "跨層節點與關聯", priority: "—" },
];

export function searchTopics(query: string): KnowledgeTopic[] {
  const q = query.trim();
  if (!q) return knowledgeTopics;
  return knowledgeTopics.filter(
    (t) =>
      t.title.includes(q) ||
      t.summary.includes(q) ||
      t.keywords.some((k) => k.includes(q)) ||
      t.relatedCodes.some((c) => c.toLowerCase().includes(q.toLowerCase()))
  );
}

// Baseline topics relevant to every case (planning + level).
const BASELINE_TOPIC_IDS = ["topic-019-AA01照顧計畫", "topic-012-CMS等級"];

/**
 * Topics relevant to a case, by matching its tags/keywords against topic
 * titles/keywords, plus the baseline planning topics. Returns source-referenced
 * topics so the Workspace reference panel can cite them.
 */
export function relatedTopics(c: CaseRecord, limit = 6): KnowledgeTopic[] {
  const needles = c.tags
    .map((t) => t.replace(/從優$/, "").trim())
    .filter(Boolean);
  const matched = new Set<string>();

  for (const t of knowledgeTopics) {
    const hit = needles.some(
      (n) =>
        t.title.includes(n) ||
        t.keywords.some((k) => k.includes(n) || n.includes(k))
    );
    if (hit) matched.add(t.id);
  }
  for (const id of BASELINE_TOPIC_IDS) matched.add(id);

  return knowledgeTopics
    .filter((t) => matched.has(t.id))
    .slice(0, limit);
}
