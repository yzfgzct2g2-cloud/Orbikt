import type { DonutSlice } from "../../data/mockDashboardData";

export function DonutChart({ slices }: { slices: DonutSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let offset = 25;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <svg className="h-36 w-36 shrink-0 -rotate-90" viewBox="0 0 44 44" role="img" aria-label="模組資料比例">
        <circle cx="22" cy="22" fill="transparent" r="15.9155" stroke="#E2E8F0" strokeWidth="6" />
        {slices.map((slice) => {
          const dash = total === 0 ? 0 : (slice.value / total) * 100;
          const element = (
            <circle
              key={slice.id}
              cx="22"
              cy="22"
              fill="transparent"
              r="15.9155"
              stroke={slice.color}
              strokeDasharray={`${dash} ${100 - dash}`}
              strokeDashoffset={offset}
              strokeWidth="6"
            />
          );
          offset -= dash;
          return element;
        })}
      </svg>
      <div className="grid flex-1 grid-cols-2 gap-2">
        {slices.map((slice) => (
          <div key={slice.id} className="rounded-xl bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="text-xs font-semibold text-slate-500">{slice.label}</span>
            </div>
            <div className="mt-1 text-lg font-bold text-slate-900">{slice.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
