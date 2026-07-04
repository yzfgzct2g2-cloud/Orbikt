import { NavLink } from "react-router-dom";
import { navItems } from "../../layout/nav";

// Orbikt sidebar — visual design adapted from the Codex UI handoff, driven by
// Orbikt's navigation (Command Center is the homepage). No module registry.
function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-[var(--color-bg-sidebar)] lg:flex">
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
            O
          </span>
          <div className="leading-tight">
            <div className="text-lg font-black text-slate-950">Orbikt</div>
            <div className="text-xs font-semibold text-slate-500">個案工作平台</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <div className="px-3 pb-2 text-xs font-bold uppercase text-slate-400">
          主要導航
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                isActive
                  ? "bg-[var(--color-primary-soft)] text-[var(--color-primary-text)]"
                  : "text-slate-600 hover:bg-[var(--color-bg-hover)] hover:text-slate-950"
              }`
            }
          >
            <Icon path={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-5 py-4">
        <div className="text-xs font-semibold text-slate-400">Orbikt v1.0.2</div>
      </div>
    </aside>
  );
}
