import type { QuickAction } from "../../data/mockDashboardData";
import type { OrbiktModule } from "../../modules/types";

export function QuickActionGrid({
  actions,
  moduleById,
}: {
  actions: QuickAction[];
  moduleById: Map<string, OrbiktModule>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {actions.map((action) => {
        const module = moduleById.get(action.moduleId);
        return (
          <button
            key={action.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
            type="button"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold" style={{ backgroundColor: module?.softColor, color: module?.color }}>
              {module?.name.slice(0, 1)}
            </span>
            <div className="mt-3 text-sm font-bold text-slate-900">{action.label}</div>
            <div className="mt-1 text-xs leading-5 text-slate-500">{action.description}</div>
          </button>
        );
      })}
    </div>
  );
}
