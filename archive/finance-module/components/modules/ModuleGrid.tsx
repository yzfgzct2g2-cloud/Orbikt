import type { OrbiktModule, OrbiktModuleId } from "../../modules/types";
import { ModuleSwitchCard } from "./ModuleSwitchCard";

export function ModuleGrid({
  modules,
  onToggle,
}: {
  modules: OrbiktModule[];
  onToggle: (id: OrbiktModuleId) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {modules.map((module) => (
        <ModuleSwitchCard
          key={module.id}
          module={module}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
