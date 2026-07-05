# Release Review — v1.3.0 (Milestone 3 — Morning Workflow)

## Scope

Complete Milestone 3 per WORKFLOW.md §8 and ACCEPTANCE.md ▸ Morning Workflow:
when a case manager opens Orbikt, the entire day is immediately understandable.
The v1.0.3 compact dashboard already covered most criteria; this release adds
daily progress and completes dashboard click-through.

## Acceptance evaluation (ACCEPTANCE ▸ Morning Workflow + Command Center)

| Criterion | Result |
| --- | --- |
| Command Center is the homepage | ✓ |
| Readable without excessive scrolling | ✓ compact one-screen layout |
| Today Tasks show planned work (not overdue counters) | ✓ |
| Today's meetings visible | ✓ schedule panel + meeting tasks |
| Visit warnings visible | ✓ Visit panel (SSOT link) |
| Dispatch follow-up visible | ✓ Dispatch panel + 派案關注 chip |
| Abnormal clearly distinguished | ✓ dedicated 異常通知 panel |
| Eisenhower Matrix classifies current work | ✓ |
| **Clicking any dashboard item opens correct destination** | ✓ NEW — KPI chips → filtered Cases registry |
| **Daily progress** | ✓ NEW — header progress bar + checkable tasks |
| Not a module launcher | ✓ |

FAIL conditions: none (priorities identifiable, abnormal items visible, no
Workspace duplication, Blueprint preserved).

## Correctness evidence (browser DOM verification)

- 逾期 chip → 38 cases (= import report byVisitStatus.overdue).
- ?dispatch=attention → 69 cases (= timeout 16 + no_capacity 35 + manual 18).
- Task check → progress 0/12 → 1/12; toggle never navigates; undo works.
- Filter chip clears back to 378 cases.
- typecheck / lint / tests (91) / build all PASS. No console errors. No raw PII.

## Blueprint / Product Memory

- Dashboard answers "今天該做什麼?" — now with progress feedback.
- Chip click-through lands on Cases (registry/triage), respecting the
  Cases-vs-Workspace distinction.
- `toggleTaskDone` is user working state for the day; it does not write to any
  source system (SSOT unaffected).
- `applyTriageFilter` reuses `dispatchAttention` — no duplicated rules.

## Deferred (recorded, not abandoned)

- Task done-state persistence across sessions (currently session-scoped;
  server persistence belongs with Supabase in Milestone 6 / backlog).
- Real calendar-sourced meetings (Google Calendar adapter — backlog).

## Verdict

**Acceptance PASS** for Milestone 3 — Morning Workflow. Release v1.3.0.
