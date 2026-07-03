import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { AiSuggestionCard } from "../components/dashboard/AiSuggestionCard";
import { DashboardSection } from "../components/dashboard/DashboardSection";
import { EisenhowerMatrix } from "../components/dashboard/EisenhowerMatrix";
import { KpiCard } from "../components/dashboard/KpiCard";
import { QuickActionGrid } from "../components/dashboard/QuickActionGrid";
import { RecentActivityList } from "../components/dashboard/RecentActivityList";
import { DonutChart } from "../components/charts/DonutChart";
import { LineChart } from "../components/charts/LineChart";
import { ModuleGrid } from "../components/modules/ModuleGrid";
import {
  buildDashboardViewModel,
  getEnabledModuleIds,
} from "../data/dashboardSelectors";
import { mockDashboardData } from "../data/mockDashboardData";
import type { OrbiktModule, OrbiktModuleId } from "../modules/types";

export type DashboardOutletContext = {
  modules: OrbiktModule[];
  toggleModule: (id: OrbiktModuleId) => void;
};

const priorityClass = {
  高: "bg-red-100 text-red-700",
  中: "bg-amber-100 text-amber-700",
  低: "bg-blue-100 text-blue-700",
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 11) return "早安";
  if (hour < 18) return "午安";
  return "晚安";
}

export function DashboardPage() {
  const { modules, toggleModule } = useOutletContext<DashboardOutletContext>();
  const viewModel = useMemo(
    () => buildDashboardViewModel(modules, mockDashboardData),
    [modules]
  );
  const moduleById = useMemo(
    () => new Map(modules.map((module) => [module.id, module])),
    [modules]
  );
  const enabledModuleIds = getEnabledModuleIds(modules);
  const now = new Date();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold text-blue-700">Orbikt Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            {greetingFor(now)}，Richard
          </h1>
          <p className="mt-2 text-sm text-slate-500">{formatDateTime(now)}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
          已啟用 {enabledModuleIds.length} 個模組
        </div>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">模組快速切換</h2>
            <p className="mt-1 text-sm text-slate-500">
              啟用狀態會即時改變 Dashboard 內容
            </p>
          </div>
        </div>
        <ModuleGrid modules={modules} onToggle={toggleModule} />
      </section>

      {enabledModuleIds.length === 0 && (
        <DashboardSection title="尚未啟用任何模組">
          <div className="text-sm text-slate-500">
            啟用模組後可在 Dashboard 查看相關資料、趨勢與 AI 建議。
          </div>
        </DashboardSection>
      )}

      <DashboardSection title="今日重點" subtitle="依目前啟用模組彙整">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {viewModel.todayHighlights.slice(0, 6).map((highlight) => {
            const module = moduleById.get(highlight.moduleId);
            return (
              <article key={highlight.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-slate-950">
                    {highlight.title}
                  </span>
                  <span className={`orbikt-badge ${priorityClass[highlight.priority]}`}>
                    {highlight.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {highlight.detail}
                </p>
                <div className="mt-3 text-xs font-bold" style={{ color: module?.color }}>
                  {module?.name}
                </div>
              </article>
            );
          })}
        </div>
      </DashboardSection>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {viewModel.kpis.slice(0, 4).map((kpi) => {
          const module = moduleById.get(kpi.moduleId);
          return module ? <KpiCard key={kpi.id} kpi={kpi} module={module} /> : null;
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <DashboardSection
          className="xl:col-span-2"
          title="啟用模組概覽"
          subtitle="停用模組後相關 Widget 不會顯示"
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {viewModel.moduleWidgets.map((widget) => {
              const module = moduleById.get(widget.moduleId);
              return (
                <article key={widget.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-950">{widget.title}</h3>
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: module?.color }} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {widget.metrics.map((metric) => (
                      <div key={metric.label} className="rounded-xl bg-slate-50 px-3 py-3">
                        <div className="text-xs font-semibold text-slate-500">{metric.label}</div>
                        <div className="mt-1 text-lg font-bold text-slate-950">{metric.value}</div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </DashboardSection>
        <AiSuggestionCard suggestion={viewModel.aiSuggestion} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <DashboardSection className="xl:col-span-3" title="艾森豪矩陣" subtitle="依重要性與緊急性排序">
          <EisenhowerMatrix quadrants={viewModel.eisenhowerQuadrants} />
        </DashboardSection>
        <DashboardSection className="xl:col-span-2" title="最近活動">
          <RecentActivityList activities={viewModel.recentActivities} moduleById={moduleById} />
        </DashboardSection>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <DashboardSection className="xl:col-span-2" title="快速操作">
          <QuickActionGrid actions={viewModel.quickActions} moduleById={moduleById} />
        </DashboardSection>
        <DashboardSection className="xl:col-span-3" title="趨勢總覽" subtitle="目前使用 mock data">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
            <LineChart series={viewModel.chartSeries} />
            <DonutChart slices={viewModel.donutSlices} />
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
