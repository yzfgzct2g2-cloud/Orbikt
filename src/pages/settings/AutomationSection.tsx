import { Badge, Card, CardHeader } from "../../components/ui/primitives";
import { automationRegistry } from "../../modules/automation/automationRegistry";

// Automation transparency (ACCEPTANCE ▸ Automation): every automated
// derivation in Orbikt, with its rule (explainable), data source (traceable),
// output surface, and code path (verifiable). Automations never write to
// source systems; at most they touch session state (and say so).
export function AutomationSection() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="自動化透明度 Automation Transparency"
        subtitle={`Orbikt 的 ${automationRegistry.length} 項自動化：規則可解釋、來源可追溯、程式可查驗；不寫入任何來源系統`}
      />
      <div className="divide-y divide-slate-100">
        {automationRegistry.map((a) => (
          <div key={a.id} className="px-5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-slate-800">
                {a.name}
              </div>
              <Badge
                className={
                  a.writes === "nothing"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-sky-100 text-sky-700"
                }
              >
                {a.writes === "nothing" ? "唯讀" : "僅工作階段狀態"}
              </Badge>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {a.rule}
            </p>
            <div className="mt-1.5 grid grid-cols-1 gap-x-6 gap-y-0.5 text-[11px] text-slate-400 sm:grid-cols-3">
              <span>來源：{a.source}</span>
              <span>呈現於：{a.surface}</span>
              <span className="font-mono">{a.codePath}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
