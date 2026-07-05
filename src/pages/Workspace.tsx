import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { dataAdapter } from "../adapters";
import type { CaseRecord } from "../adapters/types";
import { managerName } from "../config/appConfig";
import { Card } from "../components/ui/primitives";
import { caseStatusLabel } from "../lib/labels";
import { defaultTab, workspaceTabs } from "./workspace/tabs";
import { nextCaseAction, type NextActionUrgency } from "../modules/workspace/caseFocus";
import {
  caseCompletionChecklist,
  checklistProgress,
} from "../modules/workspace/caseChecklist";

// Next-action strip colours by urgency.
const nextActionClass: Record<NextActionUrgency, string> = {
  high: "border-red-200 bg-red-50",
  medium: "border-amber-200 bg-amber-50",
  low: "border-sky-200 bg-sky-50",
  none: "border-emerald-200 bg-emerald-50",
};

const nextActionDot: Record<NextActionUrgency, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-sky-500",
  none: "bg-emerald-500",
};

// A small status dot per module tab, so the case's state is visible without
// opening each tab. Reads the case's stored status (no recomputation).
function tabDotClass(key: string, c: CaseRecord): string | null {
  if (key === "aa01" || key === "fa310") {
    const s = key === "aa01" ? c.aa01Status : c.fa310Status;
    if (s === "returned") return "bg-red-500";
    if (s === "approved") return "bg-emerald-500";
    if (s === "submitted" || s === "in_progress") return "bg-amber-500";
    return null;
  }
  if (key === "visit") {
    const s = c.visit.status;
    if (s === "overdue") return "bg-red-500";
    if (s === "within_30") return "bg-orange-500";
    if (s === "within_60") return "bg-amber-500";
    if (s === "scheduled") return "bg-sky-500";
    return null;
  }
  if (key === "dispatch") {
    const s = c.dispatch.status;
    if (s === "timeout" || s === "no_capacity") return "bg-red-500";
    if (s === "manual_required") return "bg-purple-500";
    if (s === "waiting" || s === "dispatching") return "bg-amber-500";
    return null;
  }
  return null;
}
import {
  AA01Tab,
  AttachmentsTab,
  DispatchTab,
  FA310Tab,
  GenogramTab,
  OverviewTab,
  TimelineTab,
  VisitTab,
} from "./workspace/WorkspaceTabs";

export function Workspace() {
  const { caseId, tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab ?? defaultTab;

  const [record, setRecord] = useState<CaseRecord | null | undefined>(
    undefined
  );

  useEffect(() => {
    if (!caseId) return;
    let active = true;
    setRecord(undefined);
    void dataAdapter.getCase(caseId).then((c) => {
      if (active) setRecord(c);
    });
    return () => {
      active = false;
    };
  }, [caseId]);

  if (!caseId) {
    navigate("/workspace", { replace: true });
    return null;
  }

  if (record === undefined) {
    return <div className="text-sm text-slate-400">載入個案中…</div>;
  }

  if (record === null) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-600">找不到個案 {caseId}。</p>
        <Link
          to="/cases"
          className="mt-3 inline-block text-sm font-medium text-orbit-600 hover:underline"
        >
          返回個案清單
        </Link>
      </Card>
    );
  }

  const c = record;

  return (
    <div>
      {/* Case-file banner — visually distinct from the Cases registry; signals
          "you are inside a case file", the operating surface for one case. */}
      <div className="mb-4 rounded-2xl bg-gradient-to-r from-orbit-900 to-orbit-700 px-5 py-4 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
            個案工作檔 Case File
          </div>
          <Link
            to="/cases"
            className="text-xs font-medium text-white/70 hover:text-white"
          >
            ← 返回登記冊
          </Link>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{c.name}</h1>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
            {c.id}
          </span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
            {caseStatusLabel[c.status]}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/80">
          <span>個管員 {managerName(c.managerId)}</span>
          <span>CMS {c.cmsLevel ?? "—"}</span>
          <span>身分證 {c.maskedNationalId ?? "—"}</span>
          {c.area && <span>{c.area}</span>}
          {(() => {
            const p = checklistProgress(caseCompletionChecklist(c));
            return (
              <Link
                to={`/workspace/${c.id}/overview`}
                className="font-semibold text-white/90 hover:text-white"
                title="完成度檢核（Overview）"
              >
                完成度 {p.done}/{p.total}
              </Link>
            );
          })()}
        </div>
      </div>

      {/* Next action — the single most important next step for this case,
          derived from its state and visible on every tab. */}
      {(() => {
        const action = nextCaseAction(c);
        return (
          <div
            className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${nextActionClass[action.urgency]}`}
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <span
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${nextActionDot[action.urgency]}`}
              />
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  下一步 Next Action
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {action.title}
                </div>
                <div className="text-xs text-slate-600">{action.reason}</div>
              </div>
            </div>
            {action.urgency !== "none" && (
              <Link
                to={action.to}
                className="shrink-0 rounded-lg bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
              >
                前往處理 →
              </Link>
            )}
          </div>
        );
      })()}

      {/* Tab bar */}
      <div className="mb-5 flex flex-wrap gap-1 border-b border-slate-200">
        {workspaceTabs.map((t) => {
          const isActive = t.key === activeTab;
          const dot = tabDotClass(t.key, c);
          return (
            <Link
              key={t.key}
              to={`/workspace/${c.id}/${t.key}`}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-orbit-500 text-orbit-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <OverviewTab c={c} />}
      {activeTab === "aa01" && <AA01Tab c={c} />}
      {activeTab === "fa310" && <FA310Tab c={c} />}
      {activeTab === "dispatch" && <DispatchTab c={c} />}
      {activeTab === "visit" && <VisitTab c={c} />}
      {activeTab === "genogram" && <GenogramTab c={c} />}
      {activeTab === "attachments" && <AttachmentsTab c={c} />}
      {activeTab === "timeline" && <TimelineTab caseId={c.id} />}
    </div>
  );
}
