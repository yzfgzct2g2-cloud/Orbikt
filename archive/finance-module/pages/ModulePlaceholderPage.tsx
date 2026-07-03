import { Link, useParams } from "react-router-dom";
import { orbiktModules } from "../modules/registry";

const routeToModuleId = {
  finance: "finance",
  projects: "project",
  analytics: "analytics",
} as const;

export function ModulePlaceholderPage() {
  const params = useParams();
  const routeKey = params.moduleRoute as keyof typeof routeToModuleId;
  const module = orbiktModules.find(
    (item) => item.id === routeToModuleId[routeKey]
  );

  return (
    <section className="orbikt-card p-8">
      <div className="max-w-2xl">
        <p className="text-sm font-bold text-blue-700">模組頁面預留</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          {module?.name ?? "模組中心"}
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          目前階段先完成 Dashboard UI Prototype 與模組啟用狀態。此頁保留未來接真實 API、
          Telegram、Notion 或 PostgreSQL 後擴充，不在本階段串接外部服務。
        </p>
        <Link
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          to="/"
        >
          返回 Dashboard
        </Link>
      </div>
    </section>
  );
}
