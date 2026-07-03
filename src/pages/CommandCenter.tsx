import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { dataAdapter } from "../adapters";
import { team, managerName } from "../config/appConfig";
import { Badge, Card, CardHeader, PageHeader } from "../components/ui/primitives";
import { caseloadByManager } from "../lib/caseload";
import { bucketVisitWarnings, visitManager } from "../modules/visit/visitManager";
import {
  dispatchAttention,
  dispatchCounts,
  dispatchManager,
} from "../modules/dispatch/dispatchManager";
import {
  dispatchStatusClass,
  dispatchStatusLabel,
  visitStatusClass,
  visitStatusLabel,
} from "../lib/labels";
import type {
  CaseRecord,
  DocumentLink,
  ScheduleEvent,
} from "../adapters/types";

const scheduleKindClass: Record<string, string> = {
  visit: "bg-orange-100 text-orange-700",
  meeting: "bg-sky-100 text-sky-700",
  review: "bg-amber-100 text-amber-700",
  personal: "bg-slate-100 text-slate-600",
};

function hhmm(iso: string): string {
  return new Date(iso).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function Stat({
  label,
  value,
  hint,
  tone = "default",
  title,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warning" | "danger";
  title?: string;
}) {
  const toneClass =
    tone === "danger"
      ? "text-red-600"
      : tone === "warning"
        ? "text-orange-600"
        : "text-slate-900";
  return (
    <Card className="p-5">
      <div
        className="text-xs font-medium uppercase tracking-wide text-slate-400"
        title={title}
      >
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
          {managerName(c.managerId)} · CMS {c.cmsLevel ?? "—"}
        </div>
      </div>
      <Badge className={visitStatusClass[c.visit.status]}>
        {visitStatusLabel[c.visit.status]}
      </Badge>
    </Link>
  );
}

function VisitWarningRow({ c }: { c: CaseRecord }) {
  return (
    <Link
      to={`/workspace/${c.id}/visit`}
      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-slate-50"
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-900">
          {c.name}
          <span className="ml-2 text-xs text-slate-400">
            {managerName(c.managerId)}
          </span>
        </div>
        <div className="truncate text-xs text-slate-500">
          下次 {c.visit.nextDueDate ?? "—"} · 剩 {c.visit.remainingDays ?? "—"} 天
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

  const userName = useAppStore((s) => s.currentUser.name);

  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [documents, setDocuments] = useState<DocumentLink[]>([]);
  useEffect(() => {
    void dataAdapter.listSchedule().then(setSchedule);
    void dataAdapter.listDocuments().then(setDocuments);
  }, []);

  const totalCaseload = team.reduce((sum, m) => sum + m.caseload, 0);
  // Visit warnings come from the Visit Manager module (single SSOT code path).
  const visitBuckets = bucketVisitWarnings(cases);
  const within30 = visitBuckets.within_30;
  const within60 = visitBuckets.within_60;
  const overdue = visitBuckets.overdue;
  const dispatchNeedsAttention = dispatchAttention(cases);
  const openTasks = tasks.filter((t) => !t.done);
  const recentCases = [...cases]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 5);

  // Dispatch status breakdown (single dispatch module code path).
  const dispatchStatusCounts = dispatchCounts(cases);

  const caseloads = caseloadByManager(cases, team);
  const maxRef = Math.max(1, ...caseloads.map((c) => c.reference));
  const caseloadHint = caseloads
    .map((c) => `${c.name} ${c.assigned}`)
    .join(" · ");

  return (
    <div>
      <PageHeader
        title="Command Center"
        description={`${userName}，今天該做什麼？逾期訪視、派案異常與待辦一次掌握。`}
      />

      {!loaded && (
        <div className="mb-4 text-sm text-slate-400">載入中…</div>
      )}

      {/* Required first row: Total Caseload · Today Tasks · 30-Day · 60-Day */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="總個案量"
          value={cases.length}
          hint={`${team.length} 位個管員 · team.json 參考 ${totalCaseload}`}
          title={caseloadHint}
        />
        <Stat
          label="今日待辦 Today Tasks"
          value={openTasks.length}
          hint="待處理事項"
        />
        <Stat
          label="30 日內訪視"
          value={within30.length}
          tone="warning"
          hint="30-Day Visit Warning"
        />
        <Stat
          label="60 日內訪視"
          value={within60.length}
          tone="warning"
          hint="60-Day Visit Warning"
        />
      </div>

      {/* Secondary row: overdue stays visible + dispatch attention */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="訪視逾期" value={overdue.length} tone="danger" hint="需儘速安排" />
        <Stat
          label="派案需關注"
          value={dispatchNeedsAttention.length}
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

      {/* Today schedule — Calendar adapter (Google Calendar / ICS-ready) */}
      <div className="mt-6">
        <Card>
          <CardHeader
            title="今日行程 Today Schedule"
            subtitle="來源：行事曆（Google Calendar / ICS-ready）"
          />
          <div className="divide-y divide-slate-100">
            {schedule.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-4 px-5 py-3"
              >
                <div className="w-14 shrink-0 text-sm font-semibold text-slate-700">
                  {hhmm(ev.start)}
                </div>
                <Badge className={scheduleKindClass[ev.kind]}>{ev.kind}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-slate-800">
                    {ev.caseId ? (
                      <Link
                        to={`/workspace/${ev.caseId}`}
                        className="hover:text-orbit-600"
                      >
                        {ev.title}
                      </Link>
                    ) : (
                      ev.title
                    )}
                  </div>
                  {ev.location && (
                    <div className="truncate text-xs text-slate-400">
                      {ev.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {schedule.length === 0 && (
              <div className="px-5 py-6 text-sm text-slate-400">
                今日沒有行程。
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Visit warnings — SSOT: Visit Manager */}
        <Card>
          <CardHeader
            title="訪視警戒 Visit Warnings"
            subtitle={`SSOT：${visitManager.source}（僅讀取）`}
            action={
              <a
                href={visitManager.url}
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
            {within30.slice(0, 6).map((c) => (
              <VisitWarningRow key={c.id} c={c} />
            ))}
            {within30.length > 6 && (
              <div className="px-3 pt-1 text-xs text-slate-400">
                …另有 {within30.length - 6} 筆
              </div>
            )}
            <div className="mb-2 mt-4 text-xs font-semibold text-amber-600">
              60 日內（{within60.length}）
            </div>
            {within60.slice(0, 6).map((c) => (
              <VisitWarningRow key={c.id} c={c} />
            ))}
            {within60.length > 6 && (
              <div className="px-3 pt-1 text-xs text-slate-400">
                …另有 {within60.length - 6} 筆
              </div>
            )}
          </div>
        </Card>

        {/* Dispatch status — external */}
        <Card>
          <CardHeader
            title="派案狀態 Dispatch"
            subtitle={`來源：${dispatchManager.source}（${dispatchManager.status}）`}
            action={
              <a
                href={dispatchManager.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-orbit-600 hover:underline"
              >
                開啟 ↗
              </a>
            }
          />
          <div className="space-y-2 px-5 py-4">
            {dispatchStatusCounts.map(({ status, count }) => (
              <div
                key={status}
                className="flex items-center justify-between text-sm"
              >
                <Badge className={dispatchStatusClass[status]}>
                  {dispatchStatusLabel[status]}
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

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Caseload by manager — Case data vs team.json reference */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="團隊案量 Caseload by Manager"
            subtitle="來源：個案資料（實際）vs team.json（參考）"
          />
          <div className="space-y-3 px-5 py-4">
            {caseloads.map((m) => (
              <div key={m.managerId}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{m.name}</span>
                  <span className="text-slate-500">
                    {m.assigned}
                    <span className="text-slate-300"> / {m.reference}</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-orbit-500"
                    style={{
                      width: `${Math.min(100, (m.assigned / maxRef) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Documents — OneDrive link-first */}
        <Card>
          <CardHeader
            title="文件 Documents"
            subtitle="來源：OneDrive 共用資料夾"
            action={
              <Link
                to="/documents"
                className="text-xs font-medium text-orbit-600 hover:underline"
              >
                全部
              </Link>
            }
          />
          <div className="divide-y divide-slate-100">
            {documents.map((d) => (
              <a
                key={d.id}
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-5 py-3 text-sm hover:bg-slate-50"
              >
                <span className="truncate text-slate-700">{d.label}</span>
                <span className="shrink-0 text-orbit-600">開啟 ↗</span>
              </a>
            ))}
            {documents.length === 0 && (
              <div className="px-5 py-6 text-sm text-slate-400">
                尚無文件捷徑。
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
