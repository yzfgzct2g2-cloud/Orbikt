import type { RecentActivity } from "../../data/mockDashboardData";
import type { OrbiktModule } from "../../modules/types";

export function RecentActivityList({
  activities,
  moduleById,
}: {
  activities: RecentActivity[];
  moduleById: Map<string, OrbiktModule>;
}) {
  return (
    <div className="space-y-3">
      {activities.slice(0, 5).map((activity) => {
        const module = moduleById.get(activity.moduleId);
        return (
          <div key={activity.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-800">{activity.title}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: module?.color ?? "#64748B" }} />
                {activity.tag}
              </div>
            </div>
            <span className="shrink-0 text-xs font-semibold text-slate-400">{activity.time}</span>
          </div>
        );
      })}
    </div>
  );
}
