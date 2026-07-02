import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { managerName } from "../config/appConfig";
import { Badge, Card, PageHeader } from "../components/ui/primitives";
import { visitStatusClass, visitStatusLabel } from "../lib/labels";

// Workspace is case-scoped. When entered without a case, help the user pick
// one rather than showing a function menu.
export function WorkspacePicker() {
  const cases = useAppStore((s) => s.cases);

  return (
    <div>
      <PageHeader
        title="Workspace 工作區"
        description="所有個案作業都在 Workspace 進行。請選擇一個個案以開始，或至 Cases 搜尋。"
        action={
          <Link
            to="/cases"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            前往 Cases 搜尋（共 {cases.length} 筆）
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cases.slice(0, 24).map((c) => (
          <Link key={c.id} to={`/workspace/${c.id}`}>
            <Card className="p-4 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">{c.name}</div>
                <Badge className={visitStatusClass[c.visit.status]}>
                  {visitStatusLabel[c.visit.status]}
                </Badge>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {c.id} · {managerName(c.managerId)} · CMS {c.cmsLevel ?? "—"}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
