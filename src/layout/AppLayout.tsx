import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { useAppStore } from "../store/useAppStore";

// Blueprint layout: a persistent shell (Sidebar + TopHeader) around the routed
// Orbikt pages. Command Center is the homepage; this is NOT a module dashboard.
export function AppLayout() {
  const loadInitial = useAppStore((s) => s.loadInitial);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
