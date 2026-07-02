import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { dataAdapter } from "../adapters";
import type { CaseRecord } from "../adapters/types";
import { managerName } from "../config/appConfig";
import { Badge, Card } from "../components/ui/primitives";
import { caseStatusLabel } from "../lib/labels";
import { defaultTab, workspaceTabs } from "./workspace/tabs";

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
      {/* Case header — the constant context for all Workspace work */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {c.name}
            </h1>
            <Badge className="bg-orbit-50 text-orbit-700">{c.id}</Badge>
            <Badge className="bg-slate-100 text-slate-600">
              {caseStatusLabel[c.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            個管員 {managerName(c.managerId)} · CMS {c.cmsLevel ?? "—"}
          </p>
        </div>
        <Link
          to="/cases"
          className="text-sm font-medium text-slate-500 hover:text-orbit-600"
        >
          ← 個案清單
        </Link>
      </div>

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
