import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { dataAdapter } from "../adapters";
import { team } from "../config/appConfig";
import { EisenhowerMatrix } from "../components/dashboard/EisenhowerMatrix";
import { DonutChart } from "../components/charts/DonutChart";
import type { DonutSlice } from "../components/charts/chartTypes";
import { caseloadByManager } from "../lib/caseload";
import { bucketVisitWarnings, visitManager } from "../modules/visit/visitManager";
import {
  dispatchAttention,
  dispatchCounts,
  dispatchManager,
} from "../modules/dispatch/dispatchManager";
import {
  dispatchStatusLabel,
  visitStatusClass,
  visitStatusLabel,
} from "../lib/labels";
import type { ScheduleEvent } from "../adapters/types";

// --- compact building blocks ---------------------------------------------

function StatChip({
  label,
  value,
  tone = "default",
  to,
  title,
}: {
  label: string;
  value: number | string;
  tone?: "default" | "primary" | "warning" | "danger";
  to?: string;
  title?: string;
}) {
  const toneClass = {
    default: "text-slate-900",
    primary: "text-blue-700",
    warning: "text-orange-600",
    danger: "text-red-600",
  }[tone];
  const inner = (
    <div className="orbikt-card orbikt-card-hover px-3 py-2" title={title}>
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      <div className={`mt-0.5 text-2xl font-bold leading-none ${toneClass}`}>
        {value}
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function Panel({
  title,
  count,
  action,
  children,
  bodyClass = "max-h-56 overflow-y-auto",
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
  bodyClass?: string;
}) {
  return (
    <section className="orbikt-card flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <div className="text-sm font-bold text-slate-900">
          {title}
          {count !== undefined && (
            <span className="ml-1.5 text-xs font-semibold text-slate-400">
              {count}
            </span>
          )}
        </div>
        {action}
      </div>
      <div className={`p-2 ${bodyClass}`}>{children}</div>
    </section>
  );
}

function hhmm(iso: string) {
  return new Date(iso).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const abnormalTone: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

// --- page -----------------------------------------------------------------

export function CommandCenter() {
  const cases = useAppStore((s) => s.cases);
  const tasks = useAppStore((s) => s.tasks);
  const abnormal = useAppStore((s) => s.abnormal);
  const userName = useAppStore((s) => s.currentUser.name);
  const loaded = useAppStore((s) => s.loaded);
  const loading = useAppStore((s) => s.loading);
  const toggleTaskDone = useAppStore((s) => s.toggleTaskDone);
  const refreshData = useAppStore((s) => s.refreshData);
  const lastRefreshedAt = useAppStore((s) => s.lastRefreshedAt);

  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  useEffect(() => {
    void dataAdapter.listSchedule().then(setSchedule);
  }, []);

  const totalCaseload = team.reduce((sum, m) => sum + m.caseload, 0);
  const buckets = bucketVisitWarnings(cases);
  const dispatchNeedsAttention = dispatchAttention(cases);
  const openTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);
  // Daily progress = today's planned work checked off (user working state).
  const progressPct =
    tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  const caseloadHint =
    `team.json 參考 ${totalCaseload} · ` +
    caseloadByManager(cases, team)
      .map((c) => `${c.name} ${c.assigned}`)
      .join(" · ");

  const dispatchColor: Record<string, string> = {
    dispatching: "#0ea5e9",
    waiting: "#f59e0b",
    timeout: "#f97316",
    no_capacity: "#ef4444",
    manual_required: "#8b5cf6",
    accepted: "#22c55e",
    closed: "#64748b",
  };
  const dispatchDonut: DonutSlice[] = dispatchCounts(cases).map(
    ({ status, count }) => ({
      id: status,
      label: dispatchStatusLabel[status],
      value: count,
      color: dispatchColor[status] ?? "#94a3b8",
    })
  );

  const visitQuick = [...buckets.within_30, ...buckets.within_60];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Command Center</h1>
        <div className="flex items-center gap-3">
          {/* Daily progress — today's planned work checked off */}
          <div
            className="flex items-center gap-2"
            title={`今日進度：完成 ${doneTasks.length} / ${tasks.length} 項`}
          >
            <span className="text-[11px] font-semibold text-slate-500">
              今日進度
            </span>
            <div
              className="h-2 w-28 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="今日進度"
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-700">
              {doneTasks.length}/{tasks.length}
            </span>
          </div>
          {/* Defined refresh behavior: manual re-derivation, done-marks kept.
              See automationRegistry "dashboard-refresh". */}
          <button
            onClick={() => void refreshData()}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            title={
              lastRefreshedAt
                ? `最後更新 ${hhmm(lastRefreshedAt)} · 重新整理會保留已勾選的待辦`
                : "重新整理會保留已勾選的待辦"
            }
          >
            {loading ? "更新中…" : `↻ 重新整理${lastRefreshedAt ? ` · ${hhmm(lastRefreshedAt)}` : ""}`}
          </button>
          <span className="text-xs text-slate-500">
            {userName} · 今天該做什麼？{!loaded && "載入中…"}
          </span>
        </div>
      </div>

      {/* KPI strip — compact, single row */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <StatChip
          label="總案量"
          value={cases.length}
          tone="primary"
          to="/cases"
          title={caseloadHint}
        />
        <StatChip
          label="逾期"
          value={buckets.overdue.length}
          tone="danger"
          to="/cases?visit=overdue"
        />
        <StatChip
          label="30 日訪視"
          value={buckets.within_30.length}
          tone="warning"
          to="/cases?visit=within_30"
        />
        <StatChip
          label="60 日訪視"
          value={buckets.within_60.length}
          tone="warning"
          to="/cases?visit=within_60"
        />
        <StatChip
          label="派案關注"
          value={dispatchNeedsAttention.length}
          tone="warning"
          to="/cases?dispatch=attention"
        />
        <StatChip label="今日待辦" value={openTasks.length} tone="primary" />
      </div>

      {/* Main dense grid — panels scroll internally, page stays ~one screen */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Today Tasks (forward-looking, checkable → daily progress) */}
        <Panel title="今日待辦 Today Tasks" count={openTasks.length}>
          {openTasks.map((t) => (
            <TaskRow
              key={t.id}
              to={t.to}
              type={t.type}
              title={t.title}
              due={t.due}
              done={false}
              onToggle={() => toggleTaskDone(t.id)}
            />
          ))}
          {doneTasks.map((t) => (
            <TaskRow
              key={t.id}
              to={t.to}
              type={t.type}
              title={t.title}
              due={t.due}
              done
              onToggle={() => toggleTaskDone(t.id)}
            />
          ))}
          {tasks.length === 0 && <Empty text="今日暫無安排的工作。" />}
          {tasks.length > 0 && openTasks.length === 0 && (
            <Empty text="今日待辦已全部完成 ✓" />
          )}
        </Panel>

        {/* Abnormal notifications */}
        <Panel
          title="異常通知 Abnormal"
          count={abnormal.length}
          action={
            <Link
              to="/notifications"
              className="text-[11px] font-medium text-blue-600 hover:underline"
            >
              通知中心
            </Link>
          }
        >
          {abnormal.map((a) => (
            <Link
              key={a.id}
              to={a.to}
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-50"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${abnormalTone[a.severity]}`} />
              <span className="min-w-0 flex-1">
                <span className="text-xs font-medium text-slate-800">{a.title}</span>
                <span className="ml-1 truncate text-[11px] text-slate-400">{a.body}</span>
              </span>
            </Link>
          ))}
          {abnormal.length === 0 && <Empty text="目前沒有異常。" />}
        </Panel>

        {/* Eisenhower Matrix */}
        <Panel title="艾森豪矩陣 Eisenhower" bodyClass="max-h-72 overflow-y-auto">
          <EisenhowerMatrix cases={cases} />
        </Panel>
      </div>

      {/* Secondary dense row */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Dispatch status */}
        <Panel
          title="派案狀態 Dispatch"
          action={
            <a
              href={dispatchManager.url}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium text-blue-600 hover:underline"
            >
              主控台 ↗
            </a>
          }
        >
          <div className="scale-90">
            <DonutChart slices={dispatchDonut} />
          </div>
        </Panel>

        {/* Schedule */}
        <Panel title="今日行程 Schedule" count={schedule.length}>
          {schedule.map((ev) => (
            <div key={ev.id} className="flex items-center gap-2 px-2 py-1">
              <span className="w-10 shrink-0 text-[11px] font-semibold text-slate-600">
                {hhmm(ev.start)}
              </span>
              {ev.caseId ? (
                <Link
                  to={`/workspace/${ev.caseId}`}
                  className="truncate text-xs text-slate-800 hover:text-blue-600"
                >
                  {ev.title}
                </Link>
              ) : (
                <span className="truncate text-xs text-slate-800">{ev.title}</span>
              )}
            </div>
          ))}
          {schedule.length === 0 && <Empty text="今日沒有行程。" />}
        </Panel>

        {/* Visit warnings quick list (SSOT: Visit Manager) */}
        <Panel
          title="訪視警戒 Visit"
          count={visitQuick.length}
          action={
            <a
              href={visitManager.url}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium text-blue-600 hover:underline"
            >
              SSOT ↗
            </a>
          }
        >
          {visitQuick.slice(0, 12).map((c) => (
            <Link
              key={c.id}
              to={`/workspace/${c.id}/visit`}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-slate-50"
            >
              <span className="truncate text-xs text-slate-800">
                {c.name}
                <span className="ml-1 text-[11px] text-slate-400">
                  剩 {c.visit.remainingDays ?? "—"} 天
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${visitStatusClass[c.visit.status]}`}
              >
                {visitStatusLabel[c.visit.status]}
              </span>
            </Link>
          ))}
          {visitQuick.length === 0 && <Empty text="無 30/60 日內訪視。" />}
        </Panel>
      </div>
    </div>
  );
}

const taskTypeLabel: Record<string, string> = {
  meeting: "會議",
  visit: "家訪",
  plan: "計畫",
  dispatch: "派案",
  review: "審查",
  document: "文件",
  general: "一般",
};

function TaskRow({
  to,
  type,
  title,
  due,
  done,
  onToggle,
}: {
  to?: string;
  type: string;
  title: string;
  due: string;
  done: boolean;
  onToggle: () => void;
}) {
  const body = (
    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 hover:bg-slate-50">
      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
        {taskTypeLabel[type] ?? type}
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-xs ${
          done ? "text-slate-400 line-through" : "text-slate-800"
        }`}
      >
        {title}
      </span>
      <span className="shrink-0 text-[10px] text-slate-400">{due}</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1 px-1">
      {/* Done toggle — separate from navigation so checking never navigates */}
      <button
        onClick={onToggle}
        aria-label={done ? `取消完成：${title}` : `標記完成：${title}`}
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold transition-colors ${
          done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 bg-white text-transparent hover:border-emerald-400"
        }`}
      >
        ✓
      </button>
      {to && !done ? (
        <Link to={to} className="min-w-0 flex-1">
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="px-2 py-3 text-xs text-slate-400">{text}</div>;
}
