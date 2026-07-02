import { useEffect, useState } from "react";
import { dataAdapter } from "../adapters";
import type { DocumentLink } from "../adapters/types";
import { externalLinks } from "../config/externalLinks";
import { Card, CardHeader, PageHeader } from "../components/ui/primitives";

export function Documents() {
  const [docs, setDocs] = useState<DocumentLink[]>([]);

  useEffect(() => {
    void dataAdapter.listDocuments().then(setDocs);
  }, []);

  return (
    <div>
      <PageHeader
        title="Documents 文件中心"
        description="V1 以 OneDrive 共用資料夾捷徑為主，Microsoft Graph API 留待 V1.1。"
      />

      <Card>
        <CardHeader
          title="共用資料夾與捷徑"
          subtitle="來源：OneDrive（外部連結）"
        />
        <div className="divide-y divide-slate-100">
          {docs.map((d) => (
            <a
              key={d.id}
              href={d.url}
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
                  <div className="text-xs text-slate-400">{d.scope}</div>
                </div>
              </div>
              <span className="text-sm text-orbit-600">開啟 ↗</span>
            </a>
          ))}
        </div>
      </Card>

      <p className="mt-4 text-xs text-slate-400">
        個案附件也可於各個案 Workspace 的「Attachments」分頁開啟：
        <a
          href={externalLinks.onedrive.sharedFolder}
          target="_blank"
          rel="noreferrer"
          className="ml-1 text-orbit-600 hover:underline"
        >
          個管共用資料夾
        </a>
        。
      </p>
    </div>
  );
}
