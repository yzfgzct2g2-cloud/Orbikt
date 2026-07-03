# Checkpoint CP-0015

## Sprint

V1.0.1 Correction Sprint

## Status

V1_0_1_RELEASE_READY

## Summary

Fixed acceptance gaps found in external review and restored the Blueprint
architecture after an alternate "module dashboard" (記帳/發票) redesign had begun
overwriting it. All corrections verified; released as v1.0.1.

## Corrections

1. **Blueprint restore (owner-authorized).** Archived the alternate finance
   dashboard prototype into `archive/finance-module/` (not deleted; original
   structure preserved) and restored `src/App.tsx` (index → Command Center),
   `src/layout/AppLayout.tsx` (Sidebar/Header), `src/index.css`, `package.json`
   to v1.0.0. archive/ is excluded from build/typecheck/lint.
2. **Git + source-systems hygiene.** Added `source-systems/` to `.gitignore`
   (was only in local exclude); added `docs/SOURCE_SYSTEMS.md` (local-reference
   policy). Verified nothing from source-systems (nested .git / node_modules /
   dist / runtime output / PII) is tracked.
3. **Dashboard.** Command Center first row now has four separate cards: Total
   Caseload · Today Tasks · 30-Day Visit · 60-Day Visit. Overdue + dispatch
   attention moved to a visible second row (overdue not removed).
4. **FA310.** Tab now shows `maskedNationalId` for identity verification via
   `fa310IdentityLabel` (masked only, never raw). FA310 rules stay in the
   QA-Engine adapter seam, not React. Tests assert masked-only / no raw pattern.
5. **External links SSOT.** Added machine-readable `config/external-links.json`;
   `src/config/externalLinks.ts` now reads from it (no hardcoded duplicate
   literals). `external-links.md` remains the human-readable companion. Test
   added.
6. **Removed unrelated mock data.** The 發票 data (`mockDashboardData.ts`) and
   related selectors/registry are out of production `src/` (archived).
7. **Knowledge acceptance.** Relabeled as "practical index + external full
   platform link" (not full embedded Hub); citations preserved; visible link to
   the full platform.
8. **AA01 acceptance.** Labeled "AA01 engine-integrated draft mode; full
   authoring UI remains external"; link to the full AA01 system kept.
9. **Docs.** PROJECT_STATE, this checkpoint, release review, README scope +
   known limitations, CHANGELOG.

## Verification (v1.0.1)

- `npm run typecheck` PASS · `npm run test` PASS (58) · `npm run lint` PASS ·
  `npm run build` PASS.

## Known issue (environmental)

A concurrent external process (a "superpowers" dashboard-UI plan) was actively
re-generating the archived finance-dashboard files and re-modifying the entry
files during this sprint. They were re-archived/restored. **If that process is
still running it will keep re-introducing the Blueprint-conflicting redesign;
it must be stopped** for the working tree to stay clean.

## Release

- Commit corrections; tag `v1.0.1`. Push not performed (no git remote / auth).
