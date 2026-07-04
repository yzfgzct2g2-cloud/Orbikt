import { Link } from "react-router-dom";
import type { CaseRecord } from "../../adapters/types";
import {
  classifyEisenhower,
  groupByQuadrant,
  quadrantMeta,
  quadrantOrder,
} from "../../modules/dashboard/eisenhower";

// Eisenhower Matrix (decoupled) — classifies Orbikt action signals and links
// each item to the relevant case/tab. Compact 2×2 for the Command Center.
export function EisenhowerMatrix({ cases }: { cases: CaseRecord[] }) {
  const grouped = groupByQuadrant(classifyEisenhower(cases), 3);

  return (
    <div className="grid grid-cols-2 gap-2">
      {quadrantOrder.map((q) => {
        const meta = quadrantMeta[q];
        const bucket = grouped[q];
        return (
          <div key={q} className={`rounded-xl border p-2.5 ${meta.className}`}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-800">
                {meta.title}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                {meta.subtitle} · {bucket.total}
              </span>
            </div>
            <div className="space-y-1">
              {bucket.shown.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className="block truncate rounded-md bg-white/70 px-2 py-1 text-[11px] text-slate-700 hover:bg-white hover:text-slate-950"
                  title={item.label}
                >
                  {item.label}
                </Link>
              ))}
              {bucket.total > bucket.shown.length && (
                <div className="px-2 text-[10px] text-slate-400">
                  …另有 {bucket.total - bucket.shown.length} 項
                </div>
              )}
              {bucket.total === 0 && (
                <div className="px-2 py-1 text-[11px] text-slate-400">無</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
