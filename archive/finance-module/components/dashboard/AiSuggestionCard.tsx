import type { AiSuggestion } from "../../data/mockDashboardData";

export function AiSuggestionCard({ suggestion }: { suggestion: AiSuggestion }) {
  return (
    <section className="orbikt-card overflow-hidden border-indigo-100 bg-indigo-50/40">
      <div className="border-b border-indigo-100 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">AI 助理建議</h2>
            <p className="mt-1 text-sm text-indigo-700">{suggestion.status}</p>
          </div>
          <span className="orbikt-badge bg-indigo-100 text-indigo-700">AI 推論</span>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-sm leading-6 text-slate-700">{suggestion.summary}</p>
        <div className="rounded-2xl bg-white/80 p-4">
          <div className="text-xs font-bold uppercase text-slate-400">建議動作</div>
          <ul className="mt-3 space-y-2">
            {suggestion.recommendedActions.map((action) => (
              <li key={action} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                {action}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs font-semibold text-slate-500">{suggestion.confidence}</p>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700" type="button">
            查看建議
          </button>
          <button className="rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50" type="button">
            與 AI 對話
          </button>
        </div>
      </div>
    </section>
  );
}
