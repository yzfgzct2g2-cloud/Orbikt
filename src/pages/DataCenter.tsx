import { Badge, Card, CardHeader, PageHeader } from "../components/ui/primitives";
import { KpiCard } from "../components/dashboard/KpiCard";
import {
  dataPaths,
  dataSources,
  type DataSourceStatus,
} from "../modules/data/dataSources";
import {
  dataHealthSummary,
  importHistory,
  importLog,
  importReport,
  matchingResult,
  sourceIssues,
  validationResults,
  type ImportResult,
  type LogLevel,
  type ValidationStatus,
} from "../modules/data/dataCenter";

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

const resultClass: Record<ImportResult, string> = {
  success: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  skipped: "bg-slate-100 text-slate-600",
};

const resultLabel: Record<ImportResult, string> = {
  success: "成功",
  pending: "待匯入",
  skipped: "未執行",
};

const validationClass: Record<ValidationStatus, string> = {
  pass: "bg-emerald-100 text-emerald-700",
  warn: "bg-amber-100 text-amber-700",
  fail: "bg-red-100 text-red-700",
};

const logLevelClass: Record<LogLevel, string> = {
  info: "text-slate-500",
  warn: "text-amber-600",
  error: "text-red-600",
};

const issueClass = {
  high: "bg-red-100 text-red-700",
  medium: "bg-orange-100 text-orange-700",
  low: "bg-slate-100 text-slate-600",
} as const;

function fmt(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString("zh-TW") : "—";
}

export function DataCenter() {
  const health = dataHealthSummary();
  const report = importReport();
  const history = importHistory();
  const log = importLog();
  const validation = validationResults();
  const matching = matchingResult();
  const issues = sourceIssues();

  return (
    <div>
      <PageHeader
        title="Data Center 資料中心"
        description="所有來源系統的匯入、驗證、比對與去識別化狀態。瀏覽器僅讀取去識別化後資料。"
      />

      {/* Data health summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label="來源系統"
          value={health.total}
          unit="個"
          tone="primary"
          hint={`已匯入 ${health.byStatus.ok}・暫代 ${health.byStatus.seed}・待匯入 ${health.byStatus.pending}`}
        />
        <KpiCard
          label="安全資料筆數"
          value={health.totalRecords}
          unit="筆"
          tone="success"
          hint="去識別化後可供瀏覽器使用"
        />
        <KpiCard
          label="待匯入來源"
          value={health.byStatus.pending + health.byStatus.missing}
          unit="個"
          tone={health.byStatus.missing > 0 ? "danger" : "warning"}
          hint="需匯入或補齊來源"
        />
        <KpiCard
          label="隱私驗證"
          value={validation.every((v) => v.status === "pass") ? "通過" : "檢查"}
          tone={validation.some((v) => v.status === "fail") ? "danger" : "success"}
          hint="無原始身分證／電話"
        />
      </div>

      {/* Safe-import policy */}
      <Card className="mb-4">
        <div className="px-5 py-4 text-xs leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-700">安全匯入政策：</span>
          原始檔（含 PII）放於 <code className="font-mono">{dataPaths.rawRoot}</code>
          ，去識別化後輸出至 <code className="font-mono">{dataPaths.sanitizedRoot}</code>
          。匯入於本機腳本執行，身分證號僅於匯入時比對，瀏覽器只取得
          maskedNationalId。瀏覽器不直接讀取原始 Excel。
        </div>
      </Card>

      {/* Source status */}
      <Card className="mb-4">
        <CardHeader
          title="來源狀態 Source Status"
          subtitle="CS100 / FA310 / AA01 / Knowledge / Dispatch / Visit Manager"
        />
        <div className="grid grid-cols-1 gap-3 px-5 py-4 lg:grid-cols-2">
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
                <Field label="匯入報告" value={s.reportLink ?? "—"} mono />
              </div>
              {s.errors.length > 0 && (
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-amber-600">
                  {s.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-xs text-slate-500">{s.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Import report */}
        <Card>
          <CardHeader
            title="匯入報告 Import Report"
            subtitle={`${report.source}（${report.sheet}）`}
          />
          <div className="space-y-3 px-5 py-4">
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <Field label="產生時間" value={fmt(report.generatedAt)} />
              <Field label="筆數" value={String(report.count)} />
            </div>
            <Breakdown title="依個管" rows={report.breakdown.byManager} />
            <Breakdown title="依家訪狀態" rows={report.breakdown.byVisitStatus} />
            <Breakdown
              title="依派案狀態"
              rows={report.breakdown.byDispatchStatus}
            />
            <p className="text-xs leading-relaxed text-slate-400">{report.note}</p>
          </div>
        </Card>

        {/* Matching + validation */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="比對結果 Matching"
              subtitle="FA310 ↔ CS100 個管指派"
            />
            <div className="space-y-2 px-5 py-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    matching.status === "matched"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }
                >
                  {matching.status === "matched" ? "已比對" : "暫以 CS100"}
                </Badge>
                <span>
                  {matching.assignedCases} 案 / {matching.managerCount} 位個管
                </span>
              </div>
              <Field label="主要來源" value={matching.primary} />
              <Field label="次要來源" value={matching.secondary} />
              <p className="leading-relaxed text-slate-500">{matching.detail}</p>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="驗證結果 Validation"
              subtitle="隱私與資料完整性檢查"
            />
            <div className="divide-y divide-slate-100">
              {validation.map((v) => (
                <div
                  key={v.id}
                  className="flex items-start justify-between gap-3 px-5 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-700">
                      {v.label}
                    </div>
                    <div className="text-xs text-slate-500">{v.detail}</div>
                  </div>
                  <Badge className={validationClass[v.status]}>
                    {v.status === "pass"
                      ? "通過"
                      : v.status === "warn"
                        ? "注意"
                        : "失敗"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Import history */}
        <Card>
          <CardHeader title="匯入歷史 Import History" subtitle="每個來源的最後匯入" />
          <div className="divide-y divide-slate-100">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between gap-3 px-5 py-2.5"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-700">
                    {h.source}
                  </div>
                  <div className="truncate text-xs text-slate-400">
                    {fmt(h.at)}
                    {h.count !== null ? ` · ${h.count} 筆` : ""}
                  </div>
                </div>
                <Badge className={resultClass[h.result]}>
                  {resultLabel[h.result]}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Import log + source issues */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="匯入日誌 Import Log" subtitle="最新在前" />
            <div className="max-h-56 overflow-y-auto px-5 py-3">
              <ul className="space-y-1.5 font-mono text-xs">
                {log.map((l) => (
                  <li key={l.id} className={logLevelClass[l.level]}>
                    <span className="text-slate-400">
                      {l.at ? new Date(l.at).toLocaleDateString("zh-TW") : "—"}
                    </span>{" "}
                    [{l.level.toUpperCase()}] {l.source}：{l.message}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="來源警示 Source Warnings"
              subtitle="缺漏 / 過期 / 待匯入 / 暫代"
            />
            <div className="px-5 py-3">
              {issues.length === 0 ? (
                <p className="text-xs text-emerald-600">所有來源皆正常。</p>
              ) : (
                <ul className="space-y-1.5">
                  {issues.map((i) => (
                    <li
                      key={i.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="text-slate-600">
                        <span className="font-semibold">{i.source}</span>：
                        {i.message}
                      </span>
                      <Badge className={issueClass[i.severity]}>
                        {i.severity === "high"
                          ? "高"
                          : i.severity === "medium"
                            ? "中"
                            : "低"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
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

function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-slate-500">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {rows.map((r) => (
          <span
            key={r.label}
            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
          >
            {r.label} · {r.value}
          </span>
        ))}
      </div>
    </div>
  );
}
