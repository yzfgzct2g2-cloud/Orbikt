import { Link } from "react-router-dom";
import { useAppStore, selectUnreadCount } from "../store/useAppStore";
import { caseStatusLabel } from "../lib/labels";

const roleLabel: Record<string, string> = {
  case_manager: "個案管理員",
  supervisor: "督導",
  director: "主任",
  admin: "系統管理員",
};

export function Header() {
  const user = useAppStore((s) => s.currentUser);
  const unread = useAppStore(selectUnreadCount);
  const activeCount = useAppStore(
    (s) => s.cases.filter((c) => c.status === "active").length
  );

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="text-sm text-slate-500">
        服務中個案{" "}
        <span className="font-semibold text-slate-900">{activeCount}</span>{" "}
        <span className="text-slate-300">·</span> {caseStatusLabel.active}
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/notifications"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="通知"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-5 w-5"
            aria-hidden
          >
            <path
              d="M12 3a6 6 0 016 6v4l2 3H4l2-3V9a6 6 0 016-6zM10 20a2 2 0 004 0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orbit-100 text-sm font-semibold text-orbit-700">
            {user.name.slice(0, 1)}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-slate-900">
              {user.name}
            </div>
            <div className="text-[11px] text-slate-500">
              {roleLabel[user.role] ?? user.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
