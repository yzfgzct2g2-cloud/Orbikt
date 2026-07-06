# Orbikt Adapter Boundaries (Milestone 6 — External Integration)

Status: Documented. Live wiring **Blocked — Stop Condition: missing credentials
/ external authorization** (see WORKFLOW.md §11 Integration Rule).

Every external system connects through an adapter. The UI depends only on the
adapter contracts — swapping a seed/fallback implementation for a live one must
require **zero UI changes**. Live integration is never faked: surfaces state
their integration source via `IntegrationNotice`, and seed-backed sources are
labelled 暫代種子 in the Data Center.

---

## 1. DataAdapter (core case data)

- **Contract:** `src/adapters/DataAdapter.ts` (`listCases`, `getCase`,
  `getVisit`, `getDispatch`, `listTasks`, `listAbnormal`, `listCaseTasks`,
  `listNotifications`, `listDocuments`, `listSchedule`, `listTimeline`)
- **Current implementation:** `Cs100DataAdapter` (sanitized generated seed;
  `kind: "mock"`)
- **Live target:** Supabase (`kind: "supabase"`)
- **Needs:** Supabase project URL + anon/service keys; schema design; RLS
  policy for PII rules (browser must still only ever see masked identifiers)
- **Fallback:** seed adapter remains; adapter chosen at composition root
  (`src/adapters/index.ts`)

## 2. Visit Manager (visit-warning SSOT)

- **Seam:** `getVisit()` on DataAdapter + `src/modules/visit/visitManager.ts`
  (link + metadata). Orbikt READS warnings; it never recomputes remaining days.
- **Live target:** Google Apps Script web app (`config/external-links.json ▸
  googleAppsScript.visitManager`)
- **Needs:** authorized GAS endpoint contract (JSON response shape, CORS/auth
  token or doGet parameter agreement) — the exec URL alone is a UI link, not a
  documented API; calling it programmatically requires the owner's
  authorization and a stable contract
- **Probe result (2026-07-06, read-only GET):** the exec URL returns the full
  HtmlService web app「伊甸基金會個案訪視管理系統」(HTTP 200, text/html) —
  **no JSON API exists at this URL**. To integrate, the GAS project owner must
  add a JSON mode (e.g. `doGet(e)` with `e.parameter.format === "json"`
  returning `ContentService` JSON of per-case visit warnings: caseId,
  lastVisitDate, nextDueDate, remainingDays, status) or publish a second
  API-only deployment. Payload must contain only safe fields (no phone /
  address / raw ID) since the browser consumes it directly.
- **Fallback:** per-case seed visit status + external link (current)

## 3. Dispatch (external console/API)

- **Seam:** `getDispatch()` on DataAdapter +
  `src/modules/dispatch/dispatchManager.ts`
- **Live target:** Dispatch API (console at `googleAppsScript.dispatchConsole`)
- **Needs:** API base URL + authentication (key/OAuth), endpoint contract for
  per-case dispatch status
- **Fallback:** per-case seed dispatch status + console link (current)

## 4. FA310 Review (LongCare-QA-Engine)

- **Seam:** `src/modules/review/reviewAdapter.ts` (`getReview(caseId)` →
  `ReviewResult`); FA310 rules live in the Python engine, NEVER in React
- **Needs:** FA310 raw files copied to `input/FA310/` + a run of the QA engine
  producing sanitized `generated/fa310.*.json` (or a live engine endpoint)
- **Fallback:** deterministic seed review results (current), clearly labelled
- **Also unlocks:** FA310-primary manager matching in the Data Center
  (currently staged on CS100 — `matchingResult()`)

## 5. Documents (Microsoft Graph)

- **Seam:** `src/modules/documents/documents.ts` (link-first) + `listDocuments()`
- **Needs:** Azure AD app registration (client id/secret), Graph OAuth consent,
  drive/site ids for the OneDrive shared folder
- **Fallback:** OneDrive shared-folder shortcuts (current)

## 6. Calendar (Google Calendar / ICS)

- **Seam:** `listSchedule(dayISO)` — `ScheduleEvent` is already ICS/GCal-shaped
- **Needs:** Google OAuth client + Calendar API scope, or an ICS feed URL
- **Fallback:** derived schedule (standing meetings + due visits) (current)

## 7. Notifications (LINE)

- **Seam:** none yet — would extend the notifications flow
- **Needs:** LINE Messaging API channel + access token; user consent flow
- **Fallback:** in-app Notifications page (current)

## 8. Auth (Firebase / LINE)

- **Seam:** `useAppStore.currentUser` (mock auth, role model preserved)
- **Needs:** Firebase project config / LINE Login channel
- **Fallback:** mock user with switchable role (current)

---

## Stop Condition (reported)

Live wiring for every adapter above requires credentials, endpoint contracts,
or external authorization that are not present in the repository (no `.env`,
no keys — correctly so, per privacy rules). Per WORKFLOW §11 and CLAUDE.md
Stop Conditions, Milestone 6 is **Blocked** until the user supplies, per
integration they want to activate:

| Integration | Required from user |
| --- | --- |
| Supabase | project URL + keys + go-ahead on schema |
| Visit Manager GAS | endpoint contract + authorization to call it |
| Dispatch API | API URL + auth credentials |
| FA310 live | FA310 raw files into `input/FA310/` (+ engine run) |
| Microsoft Graph | Azure app registration + consent |
| Google Calendar | OAuth client or ICS URL |
| LINE | Messaging API channel token |
| Real auth | Firebase config or LINE Login channel |

Credentials must be provided via `.env` (gitignored) — never committed.
