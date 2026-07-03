import type { EisenhowerQuadrant } from "../../data/mockDashboardData";

const quadrantClass = {
  "important-urgent": "border-red-200 bg-red-50 text-red-700",
  "important-not-urgent": "border-amber-200 bg-amber-50 text-amber-700",
  "urgent-not-important": "border-blue-200 bg-blue-50 text-blue-700",
  "not-important-not-urgent": "border-slate-200 bg-slate-50 text-slate-600",
};

const priorityClass = {
  高: "bg-red-100 text-red-700",
  中: "bg-amber-100 text-amber-700",
  低: "bg-blue-100 text-blue-700",
};

export function EisenhowerMatrix({
  quadrants,
}: {
  quadrants: EisenhowerQuadrant[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {quadrants.map((quadrant) => (
        <article key={quadrant.id} className={`rounded-2xl border p-4 ${quadrantClass[quadrant.id]}`}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold">{quadrant.title}</h3>
            <span className="orbikt-badge bg-white/80 text-current">{quadrant.tasks.length} 項</span>
          </div>
          <div className="mt-4 space-y-2">
            {quadrant.tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="rounded-xl bg-white/80 px-3 py-2 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{task.title}</span>
                  <span className={`orbikt-badge ${priorityClass[task.priority]}`}>{task.priority}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">{task.due}</div>
              </div>
            ))}
            {quadrant.tasks.length === 0 && (
              <div className="rounded-xl bg-white/70 px-3 py-3 text-sm text-slate-500">目前沒有任務</div>
            )}
          </div>
          <button className="mt-4 text-sm font-bold text-current" type="button">
            查看全部
          </button>
        </article>
      ))}
    </div>
  );
}
