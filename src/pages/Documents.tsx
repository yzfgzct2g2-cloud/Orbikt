import { Card, CardHeader, PageHeader } from "../components/ui/primitives";
import {
  documentCategoryLabel,
  documentShortcuts,
  documentsManager,
} from "../modules/documents/documents";

export function Documents() {
  const available = documentShortcuts.filter((s) => s.url);
  const pending = documentShortcuts.filter((s) => !s.url);

  return (
    <div>
      <PageHeader
        title="Documents 文件中心"
        description={documentsManager.note}
      />

      <Card>
        <CardHeader
          title="文件捷徑"
          subtitle={`來源：${documentsManager.source}（外部連結）`}
        />
        <div className="divide-y divide-slate-100">
          {available.map((d) => (
            <a
              key={d.id}
              href={d.url ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orbit-50 text-orbit-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="h-5 w-5"
                    aria-hidden
                  >
                    <path
                      d="M6 2h8l4 4v16H6zM14 2v4h4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    {d.label}
                  </div>
                  <div className="text-xs text-slate-400">
                    {documentCategoryLabel[d.category]}
                  </div>
                </div>
              </div>
              <span className="text-sm text-orbit-600">開啟 ↗</span>
            </a>
          ))}
        </div>
      </Card>

      {pending.length > 0 && (
        <Card className="mt-4">
          <CardHeader
            title="待補連結"
            subtitle="下列捷徑的 OneDrive 連結尚未於 config/external-links.md 提供"
          />
          <div className="divide-y divide-slate-100">
            {pending.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between px-5 py-3 text-sm"
              >
                <span className="text-slate-500">{d.label}</span>
                <span className="text-xs text-slate-400">
                  {documentCategoryLabel[d.category]} · 待提供連結
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <p className="mt-4 text-xs text-slate-400">
        個案附件可於各個案 Workspace 的「Attachments」分頁開啟（V1 連結至個管共用資料夾）。
      </p>
    </div>
  );
}
