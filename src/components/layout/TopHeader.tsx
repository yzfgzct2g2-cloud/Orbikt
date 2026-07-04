import { Link } from "react-router-dom";
import { selectUnreadCount, useAppStore } from "../../store/useAppStore";

const roleLabel: Record<string, string> = {
  case_manager: "個案管理員",
  supervisor: "督導",
  director: "主任",
  admin: "系統管理員",
};

// Orbikt top header — visual design adapted from the Codex UI handoff, without
// the module toggle. Reads the mock-auth user + unread count from the store.
export function TopHeader() {
  const user = useAppStore((state) => state.currentUser);
  const unread = useAppStore(selectUnreadCount);
  const activeCount = useAppStore(
    (s) => s.cases.filter((c) => c.status === "active").length
  );

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
        <span className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
          服務中 {activeCount}
        </span>
        <label className="min-w-0 flex-1">
          <span className="sr-only">搜尋</span>
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
            placeholder="搜尋個案 · 姓名 / 編號 / 身分證末四碼（前往 Cases 搜尋）"
            type="search"
          />
        </label>
      </div>

      <div className="flex flex-1 items-center justify-between gap-3 md:flex-none md:justify-end">
        <Link
          aria-label="通知中心"
          className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          to="/notifications"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M12 3a6 6 0 016 6v4l2 3H4l2-3V9a6 6 0 016-6zM10 20a2 2 0 004 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {user.name.slice(0, 1)}
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-bold text-slate-900">{user.name}</div>
            <div className="text-xs text-slate-500">
              {roleLabel[user.role] ?? user.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
