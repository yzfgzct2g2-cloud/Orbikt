// Build a lightweight, source-referenced knowledge index from the real
// knowledge platform (source-systems/knowledge/practical/topics/*.json).
//
//   node scripts/buildKnowledgeIndex.mjs   (or: npm run seed:knowledge)
//
// Emits src/modules/knowledge/topics.generated.json — id, title, summary,
// keywords, and citations (related codes/articles). The full knowledge platform
// remains the SSOT; Orbikt keeps the traceable source ids so references can link
// back and AI answers can cite.

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const topicsDir = path.join(
  root,
  "source-systems/knowledge/practical/topics"
);

function truncate(s, n) {
  const str = String(s ?? "").trim();
  return str.length > n ? str.slice(0, n) + "…" : str;
}

const files = readdirSync(topicsDir).filter((f) => f.endsWith(".json"));
const topics = files
  .map((file) => {
    const raw = JSON.parse(readFileSync(path.join(topicsDir, file), "utf8"));
    const id = file.replace(/\.json$/, "");
    return {
      id, // e.g. "topic-001-外籍看護" (stable source id)
      title: String(raw.topic ?? raw.title ?? id),
      summary: truncate(raw.summary, 200),
      keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
      relatedCodes: Array.isArray(raw.related_codes) ? raw.related_codes : [],
      relatedArticles: Array.isArray(raw.related_articles)
        ? raw.related_articles
        : [],
    };
  })
  .sort((a, b) => (a.id < b.id ? -1 : 1));

const outDir = path.join(root, "src/modules/knowledge");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  path.join(outDir, "topics.generated.json"),
  JSON.stringify(topics, null, 2) + "\n",
  "utf8"
);

console.log(`Knowledge index built: ${topics.length} practical topics`);
