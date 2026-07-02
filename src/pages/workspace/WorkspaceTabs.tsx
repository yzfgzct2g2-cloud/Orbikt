import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dataAdapter } from "../../adapters";
import type {
  CaseRecord,
  TaskItem,
  TimelineEvent,
} from "../../adapters/types";
import { managerName } from "../../config/appConfig";
import { externalLinks } from "../../config/externalLinks";
import { visitManager } from "../../modules/visit/visitManager";
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
    </div>
  );
}

export function AA01Tab({ c }: { c: CaseRecord }) {
  return (
    <IntegrationNotice
      title="AA01 照顧計畫（Planner）"
      source="source-systems/aa01-ai-system · React"
      link={{ label: "開啟現行 AA01 系統", url: externalLinks.github.aa01 }}
    >
      現行 AA01 撰寫系統（評估、服務規劃、產生器、驗證、輸出）將於後續 Phase 包裝進本
      Workspace 分頁，並綁定個案 {c.name}（{c.id}）。V1 保留既有業務邏輯，不在此重寫。
    </IntegrationNotice>
  );
}

export function FA310Tab({ c }: { c: CaseRecord }) {
  return (
    <IntegrationNotice
      title="FA310 審查（Review）"
      source="source-systems/LongCare-QA-Engine · Python，透過 Adapter"
      link={{ label: "QA Engine 原始碼", url: externalLinks.github.qaEngine }}
    >
      FA310 審查規則由 LongCare-QA-Engine 提供，透過 Adapter 介接，
      <span className="font-medium text-slate-700"> 不在 React 端重建審查規則</span>。
      審查結果將綁定個案 {c.name}（{c.id}），並回填至公司 Excel 欄位 L（需人工 Approve）。
    </IntegrationNotice>
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
        source="外部派案系統 · Command Center 顯示狀態 + 外部連結"
        link={{
          label: "開啟派案主控台",
          url: externalLinks.googleAppsScript.dispatchConsole,
        }}
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
    <IntegrationNotice
      title="家系圖（Genogram）"
      source="Canvas 原型 · Workspace 整合介面"
    >
      互動家系圖目前為畫布原型階段。V1 於 Workspace 建立分頁與整合介面，
      待原型成熟後嵌入並綁定個案 {c.name}（{c.id}）。此為整合預留位置，非未完成功能。
    </IntegrationNotice>
  );
}

export function AttachmentsTab() {
  return (
    <IntegrationNotice
      title="附件（Attachments）"
      source="Document Center · OneDrive 共用資料夾捷徑"
      link={{
        label: "開啟 OneDrive 共用資料夾",
        url: externalLinks.onedrive.sharedFolder,
      }}
    >
      V1 文件以 OneDrive 共用資料夾捷徑為主，Microsoft Graph API 留待 V1.1。
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
