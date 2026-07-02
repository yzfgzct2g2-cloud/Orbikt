import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { dataAdapter } from "../../adapters";
import type {
  CaseRecord,
  TaskItem,
  TimelineEvent,
} from "../../adapters/types";
import { managerName } from "../../config/appConfig";
import { caseAttachmentLink } from "../../modules/documents/documents";
import { visitManager } from "../../modules/visit/visitManager";
import { dispatchManager } from "../../modules/dispatch/dispatchManager";
import { generateCaseAA01, planner } from "../../modules/planner/planner";
import { reviewAdapter } from "../../modules/review/reviewAdapter";
import { reviewManager } from "../../modules/review/reviewEngine";
import type { ReviewResult } from "../../modules/review/reviewTypes";
import { relatedTopics, knowledgeManager } from "../../modules/knowledge/knowledge";
import {
  genogram,
  genogramIntegrationSteps,
} from "../../modules/genogram/genogram";
import {
  Badge,
  Card,
  CardHeader,
  IntegrationNotice,
} from "../../components/ui/primitives";
import {
  caseStatusLabel,
  dispatchStatusClass,
  dispatchStatusLabel,
  moduleStatusClass,
  moduleStatusLabel,
  visitStatusClass,
  visitStatusLabel,
} from "../../lib/labels";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

export function OverviewTab({ c }: { c: CaseRecord }) {
  const references = useMemo(() => relatedTopics(c), [c]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  useEffect(() => {
    let active = true;
    void dataAdapter.listCaseTasks(c.id).then((t) => active && setTasks(t));
    void dataAdapter.listTimeline(c.id).then((e) => active && setTimeline(e));
    return () => {
      active = false;
    };
  }, [c.id]);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="個管員" value={managerName(c.managerId)} />
          <Field label="身分證" value={c.maskedNationalId ?? "—"} />
          <Field label="CMS 等級" value={c.cmsLevel ?? "未評估"} />
          <Field label="個案狀態" value={caseStatusLabel[c.status]} />
          <Field label="年齡" value={c.age ? `${c.age} 歲` : "—"} />
          <Field label="福利身分" value={c.welfare ?? "—"} />
          <Field
            label="居住地"
            value={[c.area, c.village].filter(Boolean).join(" ") || "—"}
          />
          <Field label="開案日期" value={c.openDate ?? "—"} />
          <Field label="評估日期" value={c.assessmentDate ?? "—"} />
          <Field label="照管中心" value={c.careCenter ?? "—"} />
          <Field label="照管專員" value={c.govAssessor ?? "—"} />
          <Field label="A 單位" value={c.aUnit ?? "—"} />
          <Field
            label="標籤"
            value={
              c.tags.length ? (
                <div className="flex flex-wrap gap-1">
                  {c.tags.map((t) => (
                    <Badge key={t} className="bg-slate-100 text-slate-600">
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : (
                "—"
              )
            }
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            訪視警戒（Visit Manager）
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge className={visitStatusClass[c.visit.status]}>
              {visitStatusLabel[c.visit.status]}
            </Badge>
            {c.visit.remainingDays !== null && (
              <span className="text-sm text-slate-600">
                剩餘 {c.visit.remainingDays} 天
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            上次 {c.visit.lastVisitDate ?? "—"} · 下次 {c.visit.nextDueDate ?? "—"}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            派案狀態（外部系統）
          </div>
          <div className="mt-2">
            <Badge className={dispatchStatusClass[c.dispatch.status]}>
              {dispatchStatusLabel[c.dispatch.status]}
            </Badge>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            更新於 {new Date(c.dispatch.updatedAt).toLocaleString("zh-TW")}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            AA01 照顧計畫
          </div>
          <div className="mt-2">
            <Badge className={moduleStatusClass[c.aa01Status]}>
              {moduleStatusLabel[c.aa01Status]}
            </Badge>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            FA310 審查
          </div>
          <div className="mt-2">
            <Badge className={moduleStatusClass[c.fa310Status]}>
              {moduleStatusLabel[c.fa310Status]}
            </Badge>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Case tasks (Overview = Case + Task + Timeline) */}
        <Card>
          <CardHeader title="個案待辦 Case Tasks" subtitle={`${tasks.length} 項`} />
          <div className="divide-y divide-slate-100">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-slate-800">{t.title}</div>
                  <div className="text-xs text-slate-400">到期 {t.due}</div>
                </div>
                <Badge className="bg-slate-100 text-slate-600">{t.type}</Badge>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="px-5 py-6 text-sm text-slate-400">
                目前沒有待辦事項。
              </div>
            )}
          </div>
        </Card>

        {/* Recent timeline preview */}
        <Card>
          <CardHeader
            title="近期時間軸 Recent Timeline"
            action={
              <Link
                to={`/workspace/${c.id}/timeline`}
                className="text-xs font-medium text-orbit-600 hover:underline"
              >
                全部
              </Link>
            }
          />
          <div className="px-5 py-4">
            <ol className="relative border-l border-slate-200">
              {timeline.slice(0, 4).map((e) => (
                <li key={e.id} className="mb-4 ml-4">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-orbit-500" />
                  <time className="text-xs text-slate-400">
                    {new Date(e.at).toLocaleDateString("zh-TW")}
                  </time>
                  <div className="mt-0.5 text-sm text-slate-800">{e.summary}</div>
                </li>
              ))}
            </ol>
            {timeline.length === 0 && (
              <div className="text-sm text-slate-400">尚無事件紀錄。</div>
            )}
          </div>
        </Card>
      </div>

      {/* Knowledge references — traceable sources relevant to this case */}
      <Card>
        <CardHeader
          title="相關知識參考 Knowledge References"
          subtitle="來源：長照法規知識平台（保留可追溯來源）"
          action={
            <a
              href={knowledgeManager.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-orbit-600 hover:underline"
            >
              知識平台 ↗
            </a>
          }
        />
        <div className="divide-y divide-slate-100">
          {references.map((t) => (
            <div key={t.id} className="px-5 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-800">
                  {t.title}
                </span>
                <span className="text-[11px] text-slate-400">{t.id}</span>
              </div>
              {(t.relatedCodes.length > 0 || t.relatedArticles.length > 0) && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {t.relatedCodes.map((code) => (
                    <Badge key={code} className="bg-orbit-50 text-orbit-700">
                      {code}
                    </Badge>
                  ))}
                  {t.relatedArticles.map((a) => (
                    <Badge key={a} className="bg-slate-100 text-slate-600">
                      第{a}條
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function AA01Tab({ c }: { c: CaseRecord }) {
  // Runs the vendored AA01 engine bound to this case (real generator logic).
  const result = useMemo(() => generateCaseAA01(c), [c]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              AA01 照顧計畫（Planner）
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              引擎：{planner.source}（{planner.engine}）· 綁定個案 {c.name}（{c.id}）
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={moduleStatusClass[c.aa01Status]}>
              {moduleStatusLabel[c.aa01Status]}
            </Badge>
            <a
              href={planner.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-orbit-50 px-3 py-1.5 text-sm font-medium text-orbit-700 hover:bg-orbit-100"
            >
              完整撰寫（AA01）↗
            </a>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          以下草稿由既有 AA01 產生器（vendored，未改寫規則）依 Orbikt 個案資料即時產出。
          完整評估與服務規劃請於 AA01 撰寫系統進行；此處保留業務邏輯並綁定 Case ID。
        </p>
      </Card>

      {result.warnings.length > 0 && (
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            服務檢核提醒（{result.warnings.length}）
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <CardHeader
          title="AA01 產出草稿"
          subtitle="AA01 產生器輸出（可複製後於送審文件使用）"
          action={
            <button
              onClick={copy}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              {copied ? "已複製" : "複製"}
            </button>
          }
        />
        <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap px-5 py-4 text-xs leading-relaxed text-slate-800">
          {result.draft}
        </pre>
      </Card>
    </div>
  );
}

const reviewOutcomeLabel: Record<string, string> = {
  pass: "審查通過",
  returned: "已退件",
  in_review: "審查中",
  pending: "尚未送審",
};

const reviewOutcomeClass: Record<string, string> = {
  pass: "bg-emerald-100 text-emerald-700",
  returned: "bg-red-100 text-red-700",
  in_review: "bg-sky-100 text-sky-700",
  pending: "bg-slate-100 text-slate-600",
};

const severityClass: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

export function FA310Tab({ c }: { c: CaseRecord }) {
  const [review, setReview] = useState<ReviewResult | null | undefined>(
    undefined
  );
  useEffect(() => {
    let active = true;
    setReview(undefined);
    void reviewAdapter.getReview(c.id).then((r) => active && setReview(r));
    return () => {
      active = false;
    };
  }, [c.id]);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              FA310 審查（Review）
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              審查引擎：{reviewManager.source} · 綁定個案 {c.name}（{c.id}）
            </div>
          </div>
          <div className="flex items-center gap-2">
            {review && (
              <Badge className={reviewOutcomeClass[review.outcome]}>
                {reviewOutcomeLabel[review.outcome]}
              </Badge>
            )}
            <a
              href={reviewManager.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-orbit-50 px-3 py-1.5 text-sm font-medium text-orbit-700 hover:bg-orbit-100"
            >
              QA Engine ↗
            </a>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          {reviewManager.note} 審查結果經人工 Approve 後回填公司 Excel 欄位 L。
        </p>
      </Card>

      {review === undefined && (
        <div className="text-sm text-slate-400">載入審查結果中…</div>
      )}

      {review && review.findings.length === 0 && (
        <Card className="p-5 text-sm text-slate-600">
          {review.outcome === "pass"
            ? "審查通過，目前無待修正項目。"
            : review.outcome === "in_review"
              ? "本案審查中，尚無回報項目。"
              : "本案尚未送審 FA310。"}
        </Card>
      )}

      {review &&
        review.findings.map((f) => (
          <Card key={f.findingId} className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={severityClass[f.severity]}>{f.severity}</Badge>
              <Badge className="bg-slate-100 text-slate-600">
                {f.category}
              </Badge>
              <span className="text-xs text-slate-400">
                欄位 {f.location.columnLetter ?? f.location.fieldId} · 信心{" "}
                {Math.round(f.confidence * 100)}%
              </span>
            </div>
            <div className="mt-2 text-sm text-slate-800">{f.issue}</div>
            {f.suggestion && (
              <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                建議：{f.suggestion}
              </div>
            )}
            <div className="mt-2 text-xs text-slate-400">
              依據：{f.evidence.join("、") || "—"}
            </div>
          </Card>
        ))}
    </div>
  );
}

export function DispatchTab({ c }: { c: CaseRecord }) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              目前派案狀態
            </div>
            <div className="mt-2">
              <Badge className={dispatchStatusClass[c.dispatch.status]}>
                {dispatchStatusLabel[c.dispatch.status]}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
      <IntegrationNotice
        title="派案系統（Dispatch）"
        source={`${dispatchManager.source}（${dispatchManager.status}，${dispatchManager.future}-ready）`}
        link={{ label: "開啟派案主控台", url: dispatchManager.url }}
      >
        V1 派案為外部系統，Orbikt 僅顯示派案狀態並提供外部連結，後續再 API 化。
      </IntegrationNotice>
    </div>
  );
}

export function VisitTab({ c }: { c: CaseRecord }) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field
            label="警戒狀態"
            value={
              <Badge className={visitStatusClass[c.visit.status]}>
                {visitStatusLabel[c.visit.status]}
              </Badge>
            }
          />
          <Field label="上次訪視" value={c.visit.lastVisitDate ?? "—"} />
          <Field label="下次到期" value={c.visit.nextDueDate ?? "—"} />
          <Field
            label="剩餘天數"
            value={c.visit.remainingDays ?? "—"}
          />
        </div>
      </Card>
      <IntegrationNotice
        title="訪視管理（Visit Manager）"
        source={`${visitManager.source} · 訪視警戒 SSOT（僅讀取）`}
        link={{ label: "開啟家訪倒數網頁", url: visitManager.url }}
      >
        訪視警戒的唯一真實來源為 Visit Manager，Orbikt 僅讀取或連結，
        <span className="font-medium text-slate-700"> 不重建第二套倒數邏輯</span>。
      </IntegrationNotice>
    </div>
  );
}

export function GenogramTab({ c }: { c: CaseRecord }) {
  return (
    <div className="space-y-4">
      <IntegrationNotice
        title="家系圖（Genogram）"
        source={`${genogram.source}（${genogram.status}）`}
      >
        {genogram.note} 目前綁定個案 {c.name}（{c.id}）。此為整合預留位置，非未完成功能。
      </IntegrationNotice>

      <Card className="p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          整合待辦（Integration Checklist）
        </div>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {genogramIntegrationSteps.map((step) => (
            <li key={step} className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
              {step}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function AttachmentsTab({ c }: { c: CaseRecord }) {
  const attach = caseAttachmentLink(c);
  return (
    <IntegrationNotice
      title="附件（Attachments）"
      source="Document Center · OneDrive 共用資料夾捷徑"
      link={{ label: attach.label, url: attach.url }}
    >
      V1 文件以 OneDrive 共用資料夾捷徑為主，Microsoft Graph API 留待 V1.1。
      {attach.pendingCaseFolder && (
        <span className="mt-2 block text-xs text-slate-400">
          （個案專屬子資料夾連結尚未於 config/external-links.md 提供，先連結至個管共用資料夾。）
        </span>
      )}
    </IntegrationNotice>
  );
}

export function TimelineTab({ caseId }: { caseId: string }) {
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);

  useEffect(() => {
    let active = true;
    void dataAdapter.listTimeline(caseId).then((e) => {
      if (active) setEvents(e);
    });
    return () => {
      active = false;
    };
  }, [caseId]);

  return (
    <Card>
      <CardHeader title="Timeline 時間軸" subtitle="個案事件（最新在上）" />
      <div className="px-5 py-4">
        {events === null && <div className="text-sm text-slate-400">載入中…</div>}
        {events?.length === 0 && (
          <div className="text-sm text-slate-400">尚無事件紀錄。</div>
        )}
        <ol className="relative border-l border-slate-200">
          {events?.map((e) => (
            <li key={e.id} className="mb-5 ml-4">
              <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-orbit-500" />
              <time className="text-xs text-slate-400">
                {new Date(e.at).toLocaleString("zh-TW")}
              </time>
              <div className="mt-0.5 text-sm text-slate-800">{e.summary}</div>
              <Badge className="mt-1 bg-slate-100 text-slate-500">
                {e.type}
              </Badge>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}
