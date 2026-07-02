import {
  Badge,
  Card,
  CardHeader,
  IntegrationNotice,
  PageHeader,
} from "../components/ui/primitives";
import { externalLinks } from "../config/externalLinks";

// The 7-layer knowledge architecture from source-systems/knowledge. Shown here
// so the Knowledge Hub preserves the traceable source structure; AI answers
// (later phase) must always cite these layers, never answer without reference.
const layers: { id: number; name: string; desc: string; priority: string }[] = [
  { id: 1, name: "Regulations 正式法規", desc: "條文、附表、逐條說明", priority: "100" },
  { id: 2, name: "Interpretations 函釋", desc: "函釋、公告、行政解釋", priority: "90" },
  { id: 3, name: "Rule Engine 規則引擎", desc: "規則、例外、限制、額度", priority: "85" },
  { id: 4, name: "Practical Topics 實務主題", desc: "21 個實務主題整理", priority: "80" },
  { id: 5, name: "Assistive Devices 輔具", desc: "長照／身障／醫療輔具 93 項", priority: "80" },
  { id: 6, name: "Cases 匿名案例", desc: "去識別化實務案例", priority: "70" },
  { id: 7, name: "Knowledge Graph 知識關聯", desc: "跨層節點與關聯", priority: "—" },
];

export function Knowledge() {
  return (
    <div>
      <PageHeader
        title="Knowledge 知識庫"
        description="長照法規知識平台，七層知識架構，保留可追溯來源。"
      />

      <div className="mb-4">
        <IntegrationNotice
          title="長照法規知識平台"
          source="source-systems/knowledge · 純前端本機查詢"
          link={{ label: "開啟知識平台", url: externalLinks.github.knowledge }}
        >
          Knowledge Hub 保留搜尋、服務代碼、Code Map、生效日期、函釋與 FAQ。所有 AI
          回答必須引用知識來源，不得無依據作答。Workspace 右側面板將提供情境化引用。
        </IntegrationNotice>
      </div>

      <Card>
        <CardHeader title="七層知識架構 Knowledge Layers" subtitle="priority 越高，效力／查詢優先序越前" />
        <div className="divide-y divide-slate-100">
          {layers.map((l) => (
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
                priority {l.priority}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
