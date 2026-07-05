import { Link } from "react-router-dom";
import { Badge, Card, CardHeader } from "../../components/ui/primitives";
import { dataSources, type DataSourceStatus } from "../../modules/data/dataSources";
import { dataHealthSummary } from "../../modules/data/dataCenter";

const statusClass: Record<DataSourceStatus, string> = {
  ok: "bg-emerald-100 text-emerald-700",
  seed: "bg-sky-100 text-sky-700",
  pending: "bg-amber-100 text-amber-700",
  stale: "bg-orange-100 text-orange-700",
  missing: "bg-red-100 text-red-700",
};

const statusLabel: Record<DataSourceStatus, string> = {
  ok: "已匯入",
  seed: "暫代種子",
  pending: "待匯入",
  stale: "可能過期",
  missing: "缺漏",
};

// Compact Data Sources summary for Settings. The full import / validation /
// matching surface lives in the promoted Data Center page (/data-center); this
// card is a pointer + at-a-glance status so responsibilities are not duplicated.
export function DataSourcesSection() {
  const health = dataHealthSummary();
  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="資料來源 Data Sources"
        subtitle="來源狀態摘要 · 完整匯入與驗證於資料中心"
        action={
          <Link
            to="/data-center"
            className="rounded-lg bg-orbit-50 px-3 py-1.5 text-sm font-medium text-orbit-700 hover:bg-orbit-100"
          >
            前往資料中心 →
          </Link>
        }
      />
      <div className="px-5 py-4">
        <div className="mb-3 text-xs text-slate-500">
          已匯入 {health.byStatus.ok}・暫代 {health.byStatus.seed}・待匯入{" "}
          {health.byStatus.pending}・安全資料 {health.totalRecords} 筆
        </div>
        <div className="flex flex-wrap gap-2">
          {dataSources.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700"
            >
              {s.name}
              <Badge className={statusClass[s.status]}>
                {statusLabel[s.status]}
              </Badge>
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
