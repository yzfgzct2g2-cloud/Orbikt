import type { OrbiktModule, OrbiktModuleId } from "../../modules/types";

export function ModuleSwitchCard({
  module,
  onToggle,
}: {
  module: OrbiktModule;
  onToggle: (id: OrbiktModuleId) => void;
}) {
  return (
    <article
      className="orbikt-card orbikt-card-hover min-h-[120px] p-5"
      style={{
        backgroundColor: module.enabled ? module.softColor : "#FFFFFF",
        borderColor: module.enabled ? `${module.color}55` : "#E2E8F0",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
            style={{ backgroundColor: "#FFFFFF", color: module.color }}
          >
            {module.name.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-950">
              {module.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
              {module.description}
            </p>
          </div>
        </div>
        <span
          className={`orbikt-badge shrink-0 ${
            module.enabled
              ? "bg-white text-slate-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {module.enabled ? "已啟用" : "未啟用"}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="truncate text-xs font-semibold text-slate-500">
          {module.aiCapabilities.slice(0, 2).join(" / ")}
        </div>
        <button
          aria-pressed={module.enabled}
          className={`relative h-7 w-12 rounded-full transition ${
            module.enabled ? "bg-blue-600" : "bg-slate-300"
          }`}
          onClick={() => onToggle(module.id)}
          type="button"
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
              module.enabled ? "left-6" : "left-1"
            }`}
          />
          <span className="sr-only">
            {module.enabled ? "停用" : "啟用"}
            {module.name}
          </span>
        </button>
      </div>
    </article>
  );
}
