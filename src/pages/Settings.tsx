import { useAppStore } from "../store/useAppStore";
import { team, sourceSystems } from "../config/appConfig";
import { Badge, Card, CardHeader, PageHeader } from "../components/ui/primitives";
import type { Role } from "../adapters/types";

const roles: { value: Role; label: string }[] = [
  { value: "case_manager", label: "個案管理員" },
  { value: "supervisor", label: "督導" },
  { value: "director", label: "主任" },
  { value: "admin", label: "系統管理員" },
];

export function Settings() {
  const user = useAppStore((s) => s.currentUser);
  const setRole = useAppStore((s) => s.setRole);

  return (
    <div>
      <PageHeader
        title="Settings 設定"
        description="V1 使用 Mock 認證，保留角色模型與未來真實認證升級路徑。"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="目前使用者（Mock Auth）"
            subtitle="真實認證（Firebase / LINE）於後續 Phase 接入"
          />
          <div className="px-5 py-4">
            <div className="text-sm text-slate-600">
              {user.name}（{user.id}）
            </div>
            <div className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">
              角色 Role
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    user.role === r.value
                      ? "border-orbit-500 bg-orbit-50 text-orbit-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="團隊 Team" subtitle="來源：config/team.json" />
          <div className="divide-y divide-slate-100">
            {team.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="text-sm text-slate-700">
                  {m.name}
                  <span className="ml-2 text-xs text-slate-400">{m.id}</span>
                </div>
                <Badge className="bg-slate-100 text-slate-600">
                  {m.caseload} 案
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="來源系統 Source Systems"
            subtitle="來源：config/source-systems.json"
          />
          <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-4">
            <SourceList title="可用" items={sourceSystems.available} tone="emerald" />
            <SourceList title="外部" items={sourceSystems.external} tone="sky" />
            <SourceList title="原型" items={sourceSystems.prototype} tone="amber" />
            <SourceList
              title="待補"
              items={sourceSystems.missing_or_pending}
              tone="slate"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function SourceList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "emerald" | "sky" | "amber" | "slate";
}) {
  const toneClass = {
    emerald: "bg-emerald-100 text-emerald-700",
    sky: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  }[tone];
  return (
    <div>
      <div className="mb-2 text-xs font-semibold text-slate-500">{title}</div>
      <div className="space-y-1">
        {items.map((s) => (
          <div
            key={s}
            className={`rounded-md px-2 py-1 text-xs font-medium ${toneClass}`}
          >
            {s}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-xs text-slate-400">—</div>
        )}
      </div>
    </div>
  );
}
