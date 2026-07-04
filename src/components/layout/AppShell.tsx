import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

// Visual app shell adapted from the Codex UI handoff. Decoupled from the module
// registry — it is a pure presentation wrapper around Orbikt's routed content.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-main)] text-slate-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
