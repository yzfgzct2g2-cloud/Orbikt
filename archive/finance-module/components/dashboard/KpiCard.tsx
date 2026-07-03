import type { DashboardKpi } from "../../data/mockDashboardData";
import type { OrbiktModule } from "../../modules/types";
import { Sparkline } from "../charts/Sparkline";

const trendClass = {
  up: "bg-green-50 text-green-700",
  down: "bg-blue-50 text-blue-700",
  flat: "bg-slate-100 text-slate-600",
};

export function KpiCard({
  kpi,
  module,
}: {
  kpi: DashboardKpi;
  module: OrbiktModule;
}) {
  return (
    <article className="orbikt-card orbikt-card-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{kpi.title}</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-950">{kpi.value}</span>
            <span className="pb-1 text-xs font-semibold text-slate-400">{kpi.unit}</span>
          </div>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold" style={{ backgroundColor: module.softColor, color: module.color }}>
          {module.name.slice(0, 1)}
        </span>
      </div>
      <div className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${trendClass[kpi.trend]}`}>
        {kpi.change}
      </div>
      <div className="mt-4">
        <Sparkline points={kpi.sparkline} color={module.color} label={`${kpi.title} 小趨勢`} />
      </div>
    </article>
  );
}
