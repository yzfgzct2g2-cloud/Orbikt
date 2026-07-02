import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { team, managerName } from "../config/appConfig";
import { externalLinks } from "../config/externalLinks";
import { Badge, Card, CardHeader, PageHeader } from "../components/ui/primitives";
import {
  dispatchStatusClass,
  dispatchStatusLabel,
  visitStatusClass,
  visitStatusLabel,
} from "../lib/labels";
import type { CaseRecord } from "../adapters/types";

function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-red-600"
      : tone === "warning"
        ? "text-orange-600"
        : "text-slate-900";
  return (
    <Card className="p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className={`mt-2 text-3xl font-bold ${toneClass}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </Card>
  );
}

function CaseRow({ c }: { c: CaseRecord }) {
  return (
    <Link
      to={`/workspace/${c.id}`}
      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-slate-50"
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-900">
          {c.name}
          <span className="ml-2 text-xs text-slate-400">{c.id}</span>
        </div>
        <div className="truncate text-xs text-slate-500">
          {managerName(c.managerId)} · CMS {c.cmsLevel}
        </div>
      </div>
      <Badge className={visitStatusClass[c.visit.status]}>
        {visitStatusLabel[c.visit.status]}
      </Badge>
    </Link>
  );
}

export function CommandCenter() {
  const cases = useAppStore((s) => s.cases);
  const tasks = useAppStore((s) => s.tasks);
  const notifications = useAppStore((s) => s.notifications);
  const loaded = useAppStore((s) => s.loaded);

  const totalCaseload = team.reduce((sum, m) => sum + m.caseload, 0);
  const within30 = cases.filter((c) => c.visit.status === "within_30");
  const within60 = cases.filter((c) => c.visit.status === "within_60");
  const overdue = cases.filter((c) => c.visit.status === "overdue");
  const dispatchAttention = cases.filter((c) =>
    ["timeout", "no_capacity", "manual_required"].includes(c.dispatch.status)
  );
  const openTasks = tasks.filter((t) => !t.done);
  const recentCases = [...cases]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 5);

  // Dispatch status breakdown for the Command Center panel.
  const dispatchCounts = cases.reduce<Record<string, number>>((acc, c) => {
    acc[c.dispatch.status] = (acc[c.dispatch.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Command Center"
        description="今天該做什麼？逾期訪視、派案異常與待辦一次掌握。"
      />

      {!loaded && (
        <div className="mb-4 text-sm text-slate-400">載入中…</div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="總個案量"
          value={totalCaseload}
          hint={`${team.length} 位個管員`}
        />
        <Stat label="訪視逾期" value={overdue.length} tone="danger" hint="需儘速安排" />
        <Stat
          label="30 日內到期"
          value={within30.length}
          tone="warning"
          hint="即將到期訪視"
        />
        <Stat
          label="派案需關注"
          value={dispatchAttention.length}
          tone="warning"
          hint="Timeout／無人力／人工"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Today tasks */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="今日待辦 Today Tasks"
            subtitle={`${openTasks.length} 項待處理`}
          />
          <div className="divide-y divide-slate-100">
            {openTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-slate-800">
                    {t.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    到期 {t.due}
                    {t.caseId && (
                      <>
                        {" · "}
                        <Link
                          to={`/workspace/${t.caseId}`}
                          className="text-orbit-600 hover:underline"
                        >
                          進入 Workspace
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                <Badge className="bg-slate-100 text-slate-600">{t.type}</Badge>
              </div>
            ))}
            {openTasks.length === 0 && (
              <div className="px-5 py-6 text-sm text-slate-400">
                目前沒有待辦事項。
              </div>
            )}
          </div>
        </Card>

        {/* Notifications preview */}
        <Card>
          <CardHeader
            title="通知 Notifications"
            action={
              <Link
                to="/notifications"
                className="text-xs font-medium text-orbit-600 hover:underline"
              >
                全部
              </Link>
            }
          />
          <div className="divide-y divide-slate-100">
            {notifications.slice(0, 4).map((n) => (
              <div key={n.id} className="px-5 py-3">
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-orbit-500" />
                  )}
                  <span className="text-sm font-medium text-slate-800">
                    {n.title}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{n.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Visit warnings — SSOT: Visit Manager */}
        <Card>
          <CardHeader
            title="訪視警戒 Visit Warnings"
            subtitle="來源：Visit Manager（僅讀取）"
            action={
              <a
                href={externalLinks.googleAppsScript.visitManager}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-orbit-600 hover:underline"
              >
                開啟 ↗
              </a>
            }
          />
          <div className="px-5 py-4">
            <div className="mb-2 text-xs font-semibold text-orange-600">
              30 日內（{within30.length}）
            </div>
            {within30.map((c) => (
              <CaseRow key={c.id} c={c} />
            ))}
            <div className="mb-2 mt-4 text-xs font-semibold text-amber-600">
              60 日內（{within60.length}）
            </div>
            {within60.map((c) => (
              <CaseRow key={c.id} c={c} />
            ))}
          </div>
        </Card>

        {/* Dispatch status — external */}
        <Card>
          <CardHeader
            title="派案狀態 Dispatch"
            subtitle="來源：外部派案系統"
            action={
              <a
                href={externalLinks.googleAppsScript.dispatchConsole}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-orbit-600 hover:underline"
              >
                開啟 ↗
              </a>
            }
          />
          <div className="space-y-2 px-5 py-4">
            {Object.entries(dispatchCounts).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between text-sm"
              >
                <Badge
                  className={
                    dispatchStatusClass[
                      status as keyof typeof dispatchStatusClass
                    ]
                  }
                >
                  {
                    dispatchStatusLabel[
                      status as keyof typeof dispatchStatusLabel
                    ]
                  }
                </Badge>
                <span className="font-medium text-slate-700">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent cases */}
        <Card>
          <CardHeader
            title="近期個案 Recent Cases"
            action={
              <Link
                to="/cases"
                className="text-xs font-medium text-orbit-600 hover:underline"
              >
                全部
              </Link>
            }
          />
          <div className="px-3 py-3">
            {recentCases.map((c) => (
              <CaseRow key={c.id} c={c} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
