import { Sparkline } from "../charts/Sparkline";

export type KpiTone = "default" | "primary" | "success" | "warning" | "danger";

const toneAccent: Record<KpiTone, { color: string; soft: string; value: string }> = {
  default: { color: "#475569", soft: "#f1f5f9", value: "text-slate-950" },
  primary: { color: "#2563eb", soft: "#dbeafe", value: "text-slate-950" },
  success: { color: "#16a34a", soft: "#dcfce7", value: "text-emerald-700" },
  warning: { color: "#d97706", soft: "#fef3c7", value: "text-orange-700" },
  danger: { color: "#dc2626", soft: "#fee2e2", value: "text-red-700" },
};

const trendClass = {
  up: "bg-emerald-50 text-emerald-700",
  down: "bg-blue-50 text-blue-700",
  flat: "bg-slate-100 text-slate-600",
};

/**
 * Decoupled KPI card (visual only). Adapted from the Codex UI handoff — no
 * dependency on the module registry or mock data. Feed it plain values from any
 * DataAdapter.
 */
export function KpiCard({
  label,
  value,
  unit,
  hint,
  badge,
  trend = "flat",
  tone = "default",
  sparkline,
  title,
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  badge?: string;
  trend?: "up" | "down" | "flat";
  tone?: KpiTone;
  sparkline?: number[];
  title?: string;
}) {
  const accent = toneAccent[tone];
  return (
    <article className="orbikt-card orbikt-card-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-500" title={title}>
            {label}
          </p>
          <div className="mt-2 flex items-end gap-1.5">
            <span className={`text-3xl font-bold ${accent.value}`}>{value}</span>
            {unit && (
              <span className="pb-1 text-xs font-semibold text-slate-400">{unit}</span>
            )}
          </div>
        </div>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
          style={{ backgroundColor: accent.soft, color: accent.color }}
          aria-hidden
        >
          {label.slice(0, 1)}
        </span>
      </div>
      {badge && (
        <div className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${trendClass[trend]}`}>
          {badge}
        </div>
      )}
      {hint && !badge && <div className="mt-3 text-xs text-slate-500">{hint}</div>}
      {sparkline && sparkline.length > 0 && (
        <div className="mt-4">
          <Sparkline points={sparkline} color={accent.color} label={`${label} 趨勢`} />
        </div>
      )}
    </article>
  );
}
