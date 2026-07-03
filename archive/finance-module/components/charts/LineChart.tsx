import type { ChartSeries } from "../../data/mockDashboardData";
import { pointsToPolyline } from "../../charts/chartUtils";

export function LineChart({ series }: { series: ChartSeries[] }) {
  return (
    <div className="space-y-3">
      <svg className="h-52 w-full" viewBox="0 0 520 210" role="img" aria-label="趨勢總覽">
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1="24"
            x2="500"
            y1={32 + line * 44}
            y2={32 + line * 44}
            stroke="#E2E8F0"
            strokeDasharray="4 6"
          />
        ))}
        {series.map((item) => (
          <polyline
            key={item.id}
            fill="none"
            points={pointsToPolyline(
              item.points.map((point) => point.value),
              460,
              150
            )}
            stroke={item.color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            transform="translate(30 28)"
          />
        ))}
      </svg>
      <div className="flex flex-wrap gap-3">
        {series.map((item) => (
          <span key={item.id} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
