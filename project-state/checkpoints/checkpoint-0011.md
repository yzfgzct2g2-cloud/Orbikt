# Checkpoint CP-0011

## Current Phase

Phase 9 — Knowledge Hub integration

## Status

PHASE_9_COMPLETE

## Summary

Integrated the long-term-care Knowledge platform: a source-referenced index of
the 21 practical topics is vendored into Orbikt, powering a searchable Knowledge
page and a case-relevant reference panel in the Workspace. Traceable source ids
(topic id, service codes, articles) are preserved.

## Delivered

- `scripts/buildKnowledgeIndex.mjs` (`npm run seed:knowledge`) reads
  `source-systems/knowledge/practical/topics/*.json` and emits
  `src/modules/knowledge/topics.generated.json` (id, title, summary, keywords,
  relatedCodes, relatedArticles) — real data, citations kept.
- `src/modules/knowledge/knowledge.ts` — topics loader, `knowledgeManager`
  metadata (source, platform URL, "AI must cite" note), the 7 layers,
  `searchTopics(query)`, and `relatedTopics(case)` (tag/keyword match + baseline
  planning topics).
- Knowledge page: search box + 21 topics (summary, service-code/article
  citations, source id, platform link) + 7-layer panel.
- Workspace Overview: "相關知識參考" reference panel — case-relevant topics with
  citations and a link back to the platform.
- Tests: `knowledge.test.ts` (21 topics with ids, search by title/keyword/code,
  case relevance + baseline, citation requirement).

## Blueprint compliance

- "Integrate as Knowledge page and Workspace reference panel" — both delivered.
- "Preserve search, code map, effective date, FAQ, practical/assistive
  knowledge" — topics carry keywords + service codes + article refs; the full
  platform remains the SSOT and is linked.
- "Do not remove citation/source structure; AI answers must cite" — source ids
  preserved on every entry; `knowledgeManager.note` states the citation rule.

## Build / Type Check / Tests / Lint

- Build: PASS (bundle ~478 kB / gzip 112 kB — knowledge index included).
- Typecheck: PASS · Tests: 48/48 PASS · Lint: PASS.
- Runtime smoke: Knowledge page renders topics with citations + search; Workspace
  reference panel shows case-relevant topics; no console errors.

## Note

- The full knowledge SPA (regulation articles, appendices, assistive devices,
  knowledge graph, AI Q&A) remains the SSOT and is linked; Orbikt surfaces the
  practical-topics index + references for V1. Deeper embedding is future scope.

## Next Step

Phase 10 — Genogram shell: Workspace tab with a clear integration placeholder
(prototype) and a Case ID hook, per the Blueprint (do not invent incomplete
genogram logic; do not block V1).
