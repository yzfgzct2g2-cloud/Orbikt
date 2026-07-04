import { Badge, Card, CardHeader } from "../../components/ui/primitives";
import {
  dataPaths,
  dataSources,
  type DataSourceStatus,
} from "../../modules/data/dataSources";

const statusClass: Record<DataSourceStatus, string> = {
  ok: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  stale: "bg-orange-100 text-orange-700",
  missing: "bg-red-100 text-red-700",
};

const statusLabel: Record<DataSourceStatus, string> = {
  ok: "已匯入",
  pending: "待匯入",
  stale: "可能過期",
  missing: "缺漏",
};

function fmt(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString("zh-TW") : "—";
}

export function DataSourcesSection() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="資料來源管理 Data Sources"
        subtitle="CS100 / FA310 匯入狀態與安全匯入說明"
      />
      <div className="space-y-4 px-5 py-4">
        {/* Safe import guidance */}
        <div className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
          <div className="font-semibold text-slate-700">安全匯入說明</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            <li>
              原始檔（含 PII）放於 <code className="font-mono">{dataPaths.rawRoot}</code>
              ；去識別化後的檔案輸出至 <code className="font-mono">{dataPaths.sanitizedRoot}</code>。
            </li>
            <li>
              匯入在本機腳本執行（例如 <code className="font-mono">npm run seed:cases</code>）；
              身分證號僅於匯入時處理，瀏覽器只取得 maskedNationalId。
            </li>
            <li>目前不提供瀏覽器上傳；如未來加入，僅提供本機匯入指引，不將原始 PII 輸出到瀏覽器。</li>
          </ul>
        </div>

        {dataSources.map((s) => (
          <div key={s.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-slate-900">
                {s.name}
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {s.kind}
                </span>
              </div>
              <Badge className={statusClass[s.status]}>
                {statusLabel[s.status]}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-xs text-slate-600 sm:grid-cols-2">
              <Field label="最後匯入" value={fmt(s.lastImported)} />
              <Field
                label="筆數"
                value={s.recordCount !== null ? String(s.recordCount) : "—"}
              />
              <Field label="原始檔位置" value={s.rawLocation} mono />
              <Field label="去識別化位置" value={s.sanitizedLocation} mono />
              <Field label="匯入指令" value={s.importCommand} mono />
              <Field
                label="匯入報告"
                value={
                  s.reportLink ? (
                    <span className="font-mono text-slate-700">{s.reportLink}</span>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">{s.note}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <span className="text-slate-400">{label}：</span>
      <span className={mono ? "font-mono text-slate-700" : "text-slate-700"}>
        {value}
      </span>
    </div>
  );
}
