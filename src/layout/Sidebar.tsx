import { NavLink } from "react-router-dom";
import { navItems } from "./nav";

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
    <aside className="flex h-full w-60 flex-col border-r border-slate-200 bg-orbit-900 text-slate-100">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orbit-500 font-bold">
          O
        </span>
        <div className="leading-tight">
          <div className="text-base font-bold tracking-tight">Orbikt</div>
          <div className="text-[11px] text-orbit-100/70">個案工作平台</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orbit-500 text-white"
                  : "text-orbit-100/80 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon path={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 text-[11px] text-orbit-100/50">
        Orbikt v1.0.0
      </div>
    </aside>
  );
}
