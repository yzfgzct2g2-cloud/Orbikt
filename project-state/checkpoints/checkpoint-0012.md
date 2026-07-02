# Checkpoint CP-0012

## Current Phase

Phase 10 — Genogram shell

## Status

PHASE_10_COMPLETE

## Summary

Formalized the Genogram Workspace tab as an honest integration placeholder for
the interactive family-diagram prototype, bound to the Case ID. No genogram
logic was invented; V1 is not blocked.

## Delivered

- `src/modules/genogram/genogram.ts` — `genogram` metadata (source, status
  `prototype` from integrations.json, `mode: "placeholder"`, note) and
  `genogramIntegrationSteps` (what remains before embedding).
- Workspace Genogram tab: integration-status notice + a visible integration
  checklist, bound to the case (name + id).
- Tests: `genogram.test.ts` (prototype/placeholder status, honest steps).

## Blueprint compliance

- "Create Genogram tab in Workspace" — present since Phase 0, now module-backed.
- "Provide placeholder only if prototype not ready; clearly state integration
  status" — status shown as prototype with a checklist.
- "Link Genogram data to Case ID when ready" — tab bound to Case ID; hook ready.
- "Do not invent incomplete genogram logic / do not block V1" — honored.

## Build / Type Check / Tests / Lint

- Build: PASS (bundle ~479 kB / gzip 112 kB).
- Typecheck: PASS · Tests: 50/50 PASS · Lint: PASS.
- Runtime smoke: Genogram tab renders (status + checklist, bound to case); no
  console errors.

## Next Step

Phase 11 — Document Center: OneDrive link-first document shortcuts + per-case
attachments, per the Blueprint (Microsoft Graph API deferred to V1.1).
