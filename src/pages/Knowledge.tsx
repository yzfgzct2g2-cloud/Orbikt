import { useMemo, useState } from "react";
import {
  Badge,
  Card,
  CardHeader,
  IntegrationNotice,
  PageHeader,
} from "../components/ui/primitives";
import {
  knowledgeLayers,
  knowledgeManager,
  searchTopics,
} from "../modules/knowledge/knowledge";

export function Knowledge() {
  const [query, setQuery] = useState("");
  const topics = useMemo(() => searchTopics(query), [query]);

  return (
    <div>
      <PageHeader
        title="Knowledge 知識庫（實務索引）"
        description="V1 範圍：實務主題索引（21 主題，含可追溯引用）＋ 完整知識平台外部連結。完整法規／附表／輔具／知識圖譜／AI 問答仍在外部知識平台。"
        action={
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋主題 / 關鍵字 / 服務代碼"
            className="w-72 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orbit-500"
          />
        }
      />

      <div className="mb-4">
        <IntegrationNotice
          title="Knowledge practical index + external full platform link"
          source={`${knowledgeManager.source} · source-systems/knowledge`}
          link={{ label: "開啟完整知識平台", url: knowledgeManager.url }}
        >
          目前狀態為「實務主題索引 ＋ 完整平台外部連結」，非完整內嵌 Knowledge Hub。
          {knowledgeManager.note} Workspace 會依個案顯示相關主題引用。
        </IntegrationNotice>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="實務主題 Practical Topics"
            subtitle={`${topics.length} 個主題（保留來源 id 與服務代碼引用）`}
          />
          <div className="divide-y divide-slate-100">
            {topics.map((t) => (
              <div key={t.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-900">
                    {t.title}
                  </div>
                  <a
                    href={knowledgeManager.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs font-medium text-orbit-600 hover:underline"
                  >
                    來源 ↗
                  </a>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {t.summary}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
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
                <div className="mt-1 text-[11px] text-slate-400">來源 id：{t.id}</div>
              </div>
            ))}
            {topics.length === 0 && (
              <div className="px-5 py-8 text-center text-slate-400">
                找不到符合的主題。
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="七層知識架構"
            subtitle="priority 越高，效力／查詢優先序越前"
          />
          <div className="divide-y divide-slate-100">
            {knowledgeLayers.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    L{l.id} · {l.name}
                  </div>
                  <div className="text-xs text-slate-500">{l.desc}</div>
                </div>
                <Badge className="bg-orbit-50 text-orbit-700">
                  {l.priority}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
