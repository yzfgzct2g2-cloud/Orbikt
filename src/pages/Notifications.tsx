import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Badge, Card, PageHeader } from "../components/ui/primitives";

const kindLabel: Record<string, string> = {
  visit: "訪視",
  dispatch: "派案",
  review: "審查",
  system: "系統",
};

const kindClass: Record<string, string> = {
  visit: "bg-orange-100 text-orange-700",
  dispatch: "bg-sky-100 text-sky-700",
  review: "bg-amber-100 text-amber-700",
  system: "bg-slate-100 text-slate-600",
};

export function Notifications() {
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notifications 通知中心"
        description="訪視、派案、審查與系統通知的統一入口。"
        action={
          <button
            onClick={markAllRead}
            disabled={unread === 0}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            全部標為已讀
          </button>
        }
      />

      <Card>
        <div className="divide-y divide-slate-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-4 px-5 py-4 ${
                n.read ? "" : "bg-orbit-50/40"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge className={kindClass[n.kind]}>
                    {kindLabel[n.kind]}
                  </Badge>
                  <span className="text-sm font-medium text-slate-900">
                    {n.title}
                  </span>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-orbit-500" />
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">{n.body}</p>
                <div className="mt-1 text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleString("zh-TW")}
                  {n.caseId && (
                    <>
                      {" · "}
                      <Link
                        to={`/workspace/${n.caseId}`}
                        className="text-orbit-600 hover:underline"
                      >
                        進入 Workspace
                      </Link>
                    </>
                  )}
                </div>
              </div>
              {!n.read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="shrink-0 text-xs font-medium text-orbit-600 hover:underline"
                >
                  標為已讀
                </button>
              )}
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="px-5 py-8 text-center text-slate-400">
              目前沒有通知。
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
