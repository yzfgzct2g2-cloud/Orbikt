import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { managerName } from "../config/appConfig";
import { Badge, Card, PageHeader } from "../components/ui/primitives";
import {
  caseStatusLabel,
  dispatchStatusClass,
  dispatchStatusLabel,
  moduleStatusClass,
  moduleStatusLabel,
  visitStatusClass,
  visitStatusLabel,
} from "../lib/labels";

export function Cases() {
  const cases = useAppStore((s) => s.cases);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return cases;
    return cases.filter(
      (c) =>
        c.name.includes(q) ||
        c.id.toLowerCase().includes(q.toLowerCase()) ||
        managerName(c.managerId).includes(q)
    );
  }, [cases, query]);

  return (
    <div>
      <PageHeader
        title="Cases 個案"
        description="所有個案的單一清單。點選任一個案進入其 Workspace。"
        action={
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋姓名 / 編號 / 個管員"
            className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orbit-500"
          />
        }
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">個案</th>
                <th className="px-5 py-3 font-medium">個管員</th>
                <th className="px-5 py-3 font-medium">CMS</th>
                <th className="px-5 py-3 font-medium">狀態</th>
                <th className="px-5 py-3 font-medium">訪視</th>
                <th className="px-5 py-3 font-medium">派案</th>
                <th className="px-5 py-3 font-medium">AA01</th>
                <th className="px-5 py-3 font-medium">FA310</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link
                      to={`/workspace/${c.id}`}
                      className="font-medium text-slate-900 hover:text-orbit-600"
                    >
                      {c.name}
                    </Link>
                    <div className="text-xs text-slate-400">{c.id}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {managerName(c.managerId)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.cmsLevel}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {caseStatusLabel[c.status]}
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={visitStatusClass[c.visit.status]}>
                      {visitStatusLabel[c.visit.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={dispatchStatusClass[c.dispatch.status]}>
                      {dispatchStatusLabel[c.dispatch.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={moduleStatusClass[c.aa01Status]}>
                      {moduleStatusLabel[c.aa01Status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={moduleStatusClass[c.fa310Status]}>
                      {moduleStatusLabel[c.fa310Status]}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    找不到符合條件的個案。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
