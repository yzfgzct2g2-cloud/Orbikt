import { NavLink } from "react-router-dom";
import type { OrbiktModule } from "../../modules/types";

const mainNav = [
  { to: "/", label: "總覽 Dashboard", end: true },
  { to: "/command-center", label: "長照 Command Center" },
  { to: "/cases", label: "Cases 個案" },
  { to: "/workspace", label: "Workspace 工作區" },
  { to: "/knowledge", label: "Knowledge 知識庫" },
  { to: "/documents", label: "Documents 文件" },
  { to: "/notifications", label: "Notifications 通知" },
  { to: "/settings", label: "Settings 設定" },
];

const moduleRoute: Record<string, string> = {
  care: "/cases",
  finance: "/finance",
  project: "/projects",
  knowledge: "/knowledge",
  analytics: "/analytics",
};

function Dot({ color }: { color: string }) {
  return <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />;
}

export function Sidebar({ modules }: { modules: OrbiktModule[] }) {
  const enabledModules = modules.filter((module) => module.enabled);

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-[var(--color-bg-sidebar)] lg:flex">
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
            O
          </span>
          <div className="leading-tight">
            <div className="text-lg font-black text-slate-950">Orbikt</div>
            <div className="text-xs font-semibold text-slate-500">
              AI · Knowledge · Action
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        <div>
          <div className="px-3 pb-2 text-xs font-bold uppercase text-slate-400">
            主要導航
          </div>
          <div className="space-y-1">
            {mainNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                    isActive
                      ? "bg-[var(--color-primary-soft)] text-[var(--color-primary-text)]"
                      : "text-slate-600 hover:bg-[var(--color-bg-hover)] hover:text-slate-950"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <div className="px-3 pb-2 text-xs font-bold uppercase text-slate-400">
            啟用模組
          </div>
          <div className="space-y-1">
            {enabledModules.map((module) => (
              <NavLink
                key={module.id}
                to={moduleRoute[module.id] ?? "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                    isActive
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  }`
                }
              >
                <Dot color={module.color} />
                <span>{module.name}</span>
              </NavLink>
            ))}
            {enabledModules.length === 0 && (
              <div className="rounded-xl bg-slate-100 px-3 py-3 text-sm text-slate-500">
                尚未啟用模組
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="border-t border-slate-200 px-5 py-4">
        <div className="text-xs font-semibold text-slate-400">Orbikt v1.0.0</div>
      </div>
    </aside>
  );
}
