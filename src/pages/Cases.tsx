import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  // The header search box navigates here with ?q=; Cases owns the actual search.
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setQuery(q);
  }, [searchParams]);

  const [sortKey, setSortKey] = useState<"name" | "cms" | "visit" | "manager">(
    "visit"
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return cases;
    const lower = q.toLowerCase();
    const digits = q.replace(/\D/g, "");
    // Frontend search: name, caseId, maskedNationalId, or last-4 digits only.
    // Raw national ID is never available client-side.
    return cases.filter((c) => {
      const masked = c.maskedNationalId ?? "";
      return (
        c.name.includes(q) ||
        c.id.toLowerCase().includes(lower) ||
        managerName(c.managerId).includes(q) ||
        masked.toLowerCase().includes(lower) ||
        (digits.length === 4 && masked.endsWith(digits))
      );
    });
  }, [cases, query]);

  // Triage-oriented sort (registry). Default = visit urgency for triage.
  const visitRank: Record<string, number> = {
    overdue: 0,
    within_30: 1,
    within_60: 2,
    scheduled: 3,
    normal: 4,
    completed: 5,
  };
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "cms") return (b.cmsLevel ?? -1) - (a.cmsLevel ?? -1);
      if (sortKey === "manager")
        return managerName(a.managerId).localeCompare(managerName(b.managerId));
      // visit urgency
      return (
        (visitRank[a.visit.status] ?? 9) - (visitRank[b.visit.status] ?? 9) ||
        (a.visit.remainingDays ?? 0) - (b.visit.remainingDays ?? 0)
      );
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortKey]);

  return (
    <div>
      <PageHeader
        title="Cases 個案登記冊"
        description={`個案登記與分流（registry / triage）· 共 ${sorted.length} 筆。搜尋、排序後點選個案進入其 Workspace。`}
        action={
          <div className="flex items-center gap-2">
            <select
              value={sortKey}
              onChange={(e) =>
                setSortKey(e.target.value as typeof sortKey)
              }
              className="rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-blue-500"
              aria-label="排序"
            >
              <option value="visit">排序：訪視急迫</option>
              <option value="cms">排序：CMS 高到低</option>
              <option value="name">排序：姓名</option>
              <option value="manager">排序：個管員</option>
            </select>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋姓名 / 編號 / 個管員 / 身分證末四碼"
              className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        }
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">個案</th>
                <th className="px-5 py-3 font-medium">身分證</th>
                <th className="px-5 py-3 font-medium">個管員</th>
                <th className="px-5 py-3 font-medium">居住地</th>
                <th className="px-5 py-3 font-medium">CMS</th>
                <th className="px-5 py-3 font-medium">狀態</th>
                <th className="px-5 py-3 font-medium">訪視</th>
                <th className="px-5 py-3 font-medium">派案</th>
                <th className="px-5 py-3 font-medium">AA01</th>
                <th className="px-5 py-3 font-medium">FA310</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.map((c) => (
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
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">
                    {c.maskedNationalId ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {managerName(c.managerId)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.area ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {c.cmsLevel ?? "—"}
                  </td>
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
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-slate-400">
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
