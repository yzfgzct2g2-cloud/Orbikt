// Global app store (Zustand). Holds the mock-auth session and the
// Command-Center-level data loaded from the active DataAdapter. Case-scoped
// data (a single case, its timeline) is loaded per-Workspace, not here.

import { create } from "zustand";
import { dataAdapter } from "../adapters";
import type {
  AbnormalItem,
  CaseRecord,
  NotificationItem,
  Role,
  TaskItem,
} from "../adapters/types";
import { team } from "../config/appConfig";

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
}

// V1 mock auth. Real auth (Firebase/LINE) is a later phase; the role model is
// preserved so the upgrade path is intact. Defaults to the first case manager.
const defaultUser: SessionUser = {
  id: team[0]?.id ?? "cm-001",
  name: team[0]?.name ?? "個管員",
  role: "case_manager",
};

interface AppState {
  currentUser: SessionUser;
  cases: CaseRecord[];
  tasks: TaskItem[];
  abnormal: AbnormalItem[];
  notifications: NotificationItem[];
  loaded: boolean;
  loading: boolean;
  error: string | null;

  loadInitial: () => Promise<void>;
  setRole: (role: Role) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: defaultUser,
  cases: [],
  tasks: [],
  abnormal: [],
  notifications: [],
  loaded: false,
  loading: false,
  error: null,

  loadInitial: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const [cases, tasks, abnormal, notifications] = await Promise.all([
        dataAdapter.listCases(),
        dataAdapter.listTasks(),
        dataAdapter.listAbnormal(),
        dataAdapter.listNotifications(),
      ]);
      set({ cases, tasks, abnormal, notifications, loaded: true, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "資料載入失敗",
      });
    }
  },

  setRole: (role) =>
    set((state) => ({ currentUser: { ...state.currentUser, role } })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));

export const selectUnreadCount = (state: AppState): number =>
  state.notifications.filter((n) => !n.read).length;
