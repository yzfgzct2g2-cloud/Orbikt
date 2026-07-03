import type { ReactNode } from "react";
import type { OrbiktModule, OrbiktModuleId } from "../../modules/types";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

export function AppShell({
  children,
  modules,
  onToggleModule,
}: {
  children: ReactNode;
  modules: OrbiktModule[];
  onToggleModule: (id: OrbiktModuleId) => void;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-main)] text-slate-950">
      <Sidebar modules={modules} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopHeader modules={modules} onToggleModule={onToggleModule} />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
